package api;

import sys.io.File;
import sys.FileSystem;
import sys.io.Process;
import haxe.Exception;

class NoselApi {
    public static var currentDir:String = Sys.getCwd();

    public static var colors = {
        reset: "\x1b[0m",
        filename: "\x1b[94m",
        lineCollum: "\x1b[34m",
        errorType: "\x1b[31m",
        reason: "\x1b[33m"
    };

    // The 'io' global replacement
    public static var io:Dynamic = {
        run: function(cmd:String) {
            var p = new Process(cmd);
            var r = p.stdout.readAll().toString();
            p.close();
            return r;
        },
        read: function(f:String) return File.getContent(f),
        write: function(f:String, d:String) File.saveContent(f, d),
        exists: function(f:String) return FileSystem.exists(f),
        mkdir: function(d:String) FileSystem.createDirectory(d),
        platform: Sys.systemName(),
        cwd: function() return Sys.getCwd()
    };

    public static function logln(args:Array<Dynamic>) {
        Sys.println(args.join(" "));
    }

    public static function raiseNoselError(err:Exception, isRepl:Bool = false) {
        var msg = err.message;
        var type = "Error";
        // Simple Haxe error formatting
        var formatted = '${colors.filename}${isRepl ? "REPL" : "File"}${colors.reset}:' +
                        '${colors.errorType}$type${colors.reset}:' +
                        '${colors.reason}$msg${colors.reset}';
        Sys.stderr().writeString(formatted + "\n");
    }
}
