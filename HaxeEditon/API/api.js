import sys.io.File;
import sys.FileSystem;
import sys.io.Process;

class NoselAPI {
    public static var currentDir:String = Sys.getCwd();

    public static var colors = {
        reset: "\x1b[0m",
        filename: "\x1b[94m",
        lineCollum: "\x1b[34m",
        errorType: "\x1b[31m",
        reason: "\x1b[33m"
    };

    public static function logln(args:Array<Dynamic>) {
        Sys.println(args.join(" "));
    }

    // Helper to format errors (simplified since Haxe's callstack is different from Node's)
    public static function raiseNoselError(err:haxe.Exception, isRepl:Bool = false) {
        var fileName = isRepl ? "REPL" : "unknown";
        var line = "0";
        var type = "Error";
        var reason = err.message;

        var formatted = '${colors.filename}$fileName${colors.reset}:' +
                        '${colors.lineCollum}$line${colors.reset}:' +
                        '${colors.errorType}$type${colors.reset}:' +
                        '${colors.reason}$reason${colors.reset}';
        
        Sys.stderr().writeString(formatted + "\n");
    }
}

// Emulating your "io" object
class IO {
    public static function run(cmd:String):String {
        var proc = new Process(cmd);
        var res = proc.stdout.readAll().toString();
        proc.close();
        return res;
    }
    public static function read(path:String):String return File.getContent(path);
    public static function write(path:String, data:String) File.saveContent(path, data);
    public static function exists(path:String):Bool return FileSystem.exists(path);
    public static function mkdir(path:String) FileSystem.createDirectory(path);
    public static function platform():String return Sys.systemName();
}
