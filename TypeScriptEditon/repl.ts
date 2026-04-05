import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import './API/api'; // Execute the global setup

const colors = {
    reset: "\x1b[0m",
    keyword: "\x1b[33;1m",
    string: "\x1b[32m",
    number: "\x1b[36m",
    prompt: "\x1b[35;1m",
};

/**
 * Note: To use require.extensions in TS, you may need to cast 'require' 
 * as 'any' or use the @types/node definition.
 */
(require as any).extensions['.ns'] = function (module: any, filename: string) {
    const content = fs.readFileSync(filename, 'utf8');
    const oldDir = global.NoselConfig.currentDir;
    global.NoselConfig.currentDir = path.dirname(filename);
    
    module._compile(transpile(content), filename);
    
    global.NoselConfig.currentDir = oldDir; 
};

function highlight(code: string | any): string {
    if (typeof code !== 'string') return String(code);
    return code
        .replace(/\b(extend class|import|const|let|var|function|return|exports)\b/g, `${colors.keyword}$1${colors.reset}`)
        .replace(/(".+?"|'.+?'|`.+?`)/g, `${colors.string}$1${colors.reset}`)
        .replace(/\b(\d+)\b/g, `${colors.number}$1${colors.reset}`);
}

function transpile(code: string): string {
    return code
        .replace(/import\s+([\w.]+);/g, (_match, dotPath: string) => {
            const parts = dotPath.split('.');
            const name = parts[parts.length - 1];
            
            if (name === 'io') return `const io = global.io;`;

            const targetPath = path.resolve(global.NoselConfig.currentDir, ...parts) + ".ns";
            return `const ${name} = require(${JSON.stringify(targetPath)});`;
        })
        .replace(/extend\s+class/g, 'class')
        .replace(/exports\s*=\s*/g, 'module.exports = ')
        .replace(/\blogln\b/g, 'logln');
}

const targetFile = process.argv[2];

if (targetFile) {
    const filePath = path.resolve(targetFile);
    
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
    console.log(`NoselScript Source-Compiled (TypeScript Edition) v.1.0.0`);
    
    const rl = readline.createInterface({ 
        input: process.stdin, 
        output: process.stdout, 
        prompt: '' 
    });

    const renderPrompt = (isMulti: boolean) => {
        process.stdout.write(`${colors.prompt}${isMulti ? '>>>' : '>'} ${colors.reset}`);
    };

    renderPrompt(false);
    let buffer = '';

    rl.on('line', (line: string) => {
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
                        process.stdout.write(highlight(result) + '\n');
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
