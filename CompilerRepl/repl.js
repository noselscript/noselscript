const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * PKG FIX: 
 * We use a literal string here so the 'pkg' compiler can statically 
 * analyze and bundle the API into the binary snapshot.
 */
require('../API/api.js');

const colors = {
    reset: "\x1b[0m",
    keyword: "\x1b[33;1m",
    string: "\x1b[32m",
    number: "\x1b[36m",
    prompt: "\x1b[35;1m",
};

// --- Module Support ---
require.extensions['.ns'] = function (module, filename) {
    const content = fs.readFileSync(filename, 'utf8');
    const oldDir = global.NoselConfig.currentDir;
    global.NoselConfig.currentDir = path.dirname(filename);
    
    module._compile(transpile(content), filename);
    
    global.NoselConfig.currentDir = oldDir; 
};

function highlight(code) {
    if (typeof code !== 'string') return code;
    return code
        .replace(/\b(extend class|import|const|let|var|function|return|exports)\b/g, `${colors.keyword}$1${colors.reset}`)
        .replace(/(".+?"|'.+?'|`.+?`)/g, `${colors.string}$1${colors.reset}`)
        .replace(/\b(\d+)\b/g, `${colors.number}$1${colors.reset}`);
}

function transpile(code) {
    return code
        .replace(/import\s+([\w.]+);/g, (match, dotPath) => {
            const parts = dotPath.split('.');
            const name = parts[parts.length - 1];
            
            // Handle built-in fake module
            if (name === 'io') return `const io = global.io;`;

            /**
             * CRITICAL FIX:
             * We use JSON.stringify(targetPath) to ensure Windows backslashes (\) 
             * are escaped (\\) so eval() doesn't throw a SyntaxError.
             */
            const targetPath = path.resolve(global.NoselConfig.currentDir, ...parts) + ".ns";
            return `const ${name} = require(${JSON.stringify(targetPath)});`;
        })
        .replace(/extend\s+class/g, 'class')
        .replace(/exports\s*=\s*/g, 'module.exports = ')
        .replace(/\blogln\b/g, 'logln');
}

if (process.argv[2]) {
    // Run File Mode
    const filePath = path.resolve(process.argv[2]);
    
    if (!fs.existsSync(filePath)) {
        console.error(`\x1b[31mError: Script not found at ${filePath}\x1b[0m`);
        process.exit(1);
    }

    global.NoselConfig.currentDir = path.dirname(filePath);
    
    try {
        const code = fs.readFileSync(filePath, 'utf8');
        eval(transpile(code));
    } catch (err) {
        global.raiseNoselError(err, false);
    }
} else {
    // REPL Mode
    console.log(`NoselScript Source-Compiled v.1.0.0`);
    console.log(`A programming language with an ide, conversion to python, etc.`);
    
    const rl = readline.createInterface({ 
        input: process.stdin, 
        output: process.stdout, 
        prompt: '' 
    });

    const renderPrompt = (isMulti) => {
        process.stdout.write(`${colors.prompt}${isMulti ? '>>>' : '>'} ${colors.reset}`);
    };

    renderPrompt(false);
    let buffer = '';

    rl.on('line', (line) => {
        buffer += line + '\n';
        const openBraces = (buffer.match(/{/g) || []).length;
        const closeBraces = (buffer.match(/}/g) || []).length;

        if (openBraces > closeBraces) {
            renderPrompt(true);
        } else {
            try {
                if (buffer.trim()) {
                    const result = eval(transpile(buffer));
                    if (result !== undefined) {
                        process.stdout.write(highlight(String(result)) + '\n');
                    }
                }
            } catch (err) {
                global.raiseNoselError(err, true);
            }
            buffer = '';
            renderPrompt(false);
        }
    });
}