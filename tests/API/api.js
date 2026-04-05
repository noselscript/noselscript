const path = require('path');

const colors = {
    reset: "\x1b[0m",
    filename: "\x1b[94m", // Light Blue
    lineCollum: "\x1b[34m", // Blue
    errorType: "\x1b[31m",  // Red
    reason: "\x1b[33m",     // Yellow
};

// Track the directory of the currently running script
global.NoselConfig = {
    currentDir: process.cwd()
};

global.logln = Object.assign(
    (...args) => console.log(...args),
    {
        error: (...args) => console.error(...args),
        warn: (...args) => console.warn(...args)
    }
);

global.exports = (moduleName, content) => {
    module.exports = content;
};

global.raiseNoselError = (err, isRepl = false) => {
    const stack = err.stack.split('\n');
    const stackLine = stack.find(l => l.includes(':')) || "";
    const match = stackLine.match(/evalmachine\.<anonymous>:(\d+):(\d+)/) || 
                  stackLine.match(/at\s+(.+):(\d+):(\d+)/);

    const fileName = isRepl ? "REPL" : (match ? path.basename(match[1]) : "unknown");
    const line = match ? match[2] : "0";
    const column = match ? match[3] : "0";
    const type = err.name;
    const reason = err.message;

    const formatted = `${colors.filename}${fileName}${colors.reset}:` +
                      `${colors.lineCollum}${line}${colors.reset}:` +
                      `${colors.lineCollum}${column}${colors.reset}:` +
                      `${colors.errorType}${type}${colors.reset}:` +
                      `${colors.reason}${reason}${colors.reset}`;
    
    console.error(formatted);
};