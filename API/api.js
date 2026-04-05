const path = require('path');
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');

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

// Define IO directly on global for the built-in "fake" module
global.io = {
    run: (cmd) => execSync(cmd, { encoding: 'utf8' }),
    execute: (cmd, args) => spawnSync(cmd, args, { encoding: 'utf8' }),
    read: (file) => fs.readFileSync(file, 'utf8'),
    write: (file, data) => fs.writeFileSync(file, data),
    exists: (file) => fs.existsSync(file),
    mkdir: (dir) => fs.mkdirSync(dir, { recursive: true }),
    platform: process.platform,
    cwd: () => process.cwd()
};

// Map logln globals
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

// The central error handler for NoselScript
global.raiseNoselError = (err, isRepl = false) => {
    const stack = err.stack ? err.stack.split('\n') : ["unknown:0:0"];
    
    // Grab the first line of the stack trace that contains a file/line
    const stackLine = stack.find(l => l.includes(':')) || "";
    const match = stackLine.match(/evalmachine\.<anonymous>:(\d+):(\d+)/) || 
                  stackLine.match(/at\s+(.+):(\d+):(\d+)/);

    const fileName = isRepl ? "REPL" : (match ? path.basename(match[1]) : "unknown");
    const line = match ? match[2] : "0";
    const column = match ? match[3] : "0";
    const type = err.name || "Error";
    const reason = err.message || err;

    // Format: (filename):(line):(collum):(Error type):(error reason)
    const formatted = `${colors.filename}${fileName}${colors.reset}:` +
                      `${colors.lineCollum}${line}${colors.reset}:` +
                      `${colors.lineCollum}${column}${colors.reset}:` +
                      `${colors.errorType}${type}${colors.reset}:` +
                      `${colors.reason}${reason}${colors.reset}`;
    
    console.error(formatted);
};