import * as path from 'path';
import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';

export interface INoselConfig {
    currentDir: string;
}

export interface INoselIO {
    run: (cmd: string) => string;
    execute: (cmd: string, args: string[]) => any;
    read: (file: string) => string;
    write: (file: string, data: string) => void;
    exists: (file: string) => boolean;
    mkdir: (dir: string) => void;
    platform: NodeJS.Platform;
    cwd: () => string;
}

const colors = {
    reset: "\x1b[0m",
    filename: "\x1b[94m",
    lineCollum: "\x1b[34m",
    errorType: "\x1b[31m",
    reason: "\x1b[33m",
};

// Global augmentation to let TS know about our custom properties
declare global {
    var NoselConfig: INoselConfig;
    var io: INoselIO;
    var logln: any;
    var raiseNoselError: (err: any, isRepl?: boolean) => void;
}

global.NoselConfig = {
    currentDir: process.cwd()
};

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

global.logln = Object.assign(
    (...args: any[]) => console.log(...args),
    {
        error: (...args: any[]) => console.error(...args),
        warn: (...args: any[]) => console.warn(...args)
    }
);

global.raiseNoselError = (err: any, isRepl: boolean = false): void => {
    const stack = err?.stack ? (err.stack as string).split('\n') : ["unknown:0:0"];
    const stackLine = stack.find(l => l.includes(':')) || "";
    const match = stackLine.match(/evalmachine\.<anonymous>:(\d+):(\d+)/) || 
                  stackLine.match(/at\s+(.+):(\d+):(\d+)/);

    const fileName = isRepl ? "REPL" : (match ? path.basename(match[1]) : "unknown");
    const line = match ? match[2] : "0";
    const column = match ? match[3] : "0";
    const type = err?.name || "Error";
    const reason = err?.message || String(err);

    const formatted = `${colors.filename}${fileName}${colors.reset}:` +
                      `${colors.lineCollum}${line}${colors.reset}:` +
                      `${colors.lineCollum}${column}${colors.reset}:` +
                      `${colors.errorType}${type}${colors.reset}:` +
                      `${colors.reason}${reason}${colors.reset}`;
    
    console.error(formatted);
};
