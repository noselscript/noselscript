import sys.io.File;
import sys.FileSystem;
import haxe.io.Path;

class Main {
    static var colors = {
        reset: "\x1b[0m",
        keyword: "\x1b[33;1m",
        string: "\x1b[32m",
        number: "\x1b[36m",
        prompt: "\x1b[35;1m"
    };

    static function highlight(code:String):String {
        var rKeywords = ~/(\b(extend class|import|const|let|var|function|return|exports)\b)/g;
        var rStrings = ~/(".+?"|'.+?'|`.+?`)/g;
        var rNumbers = ~/(\b\d+\b)/g;

        code = rKeywords.replace(code, colors.keyword + "$1" + colors.reset);
        code = rStrings.replace(code, colors.string + "$1" + colors.reset);
        code = rNumbers.replace(code, colors.number + "$1" + colors.reset);
        return code;
    }

    static function transpile(code:String):String {
        // Import handling
        var rImport = ~/import\s+([\w.]+);/g;
        code = rImport.map(code, function(re) {
            var dotPath = re.matched(1);
            if (dotPath == "io") return "var io = IO;";
            
            var parts = dotPath.split(".");
            var name = parts[parts.length - 1];
            var targetPath = Path.join([NoselAPI.currentDir, parts.join("/")]) + ".ns";
            return 'var $name = NoselRuntime.require("${targetPath}");';
        });

        // Syntax Sugar
        code = StringTools.replace(code, "extend class", "class");
        code = StringTools.replace(code, "exports =", "module.exports =");
        
        return code;
    }

    static function main() {
        var args = Sys.args();

        if (args.length > 0) {
            // File Mode
            var filePath = Path.normalize(args[0]);
            if (!FileSystem.exists(filePath)) {
                Sys.println("\x1b[31mError: Script not found\x1b[0m");
                return;
            }

            NoselAPI.currentDir = Path.directory(filePath);
            try {
                var content = File.getContent(filePath);
                var jsCode = transpile(content);
                // In a real Haxe tool, you'd output this to a file or use an interpreter
                Sys.println("--- Transpiled Output ---");
                Sys.println(jsCode);
            } catch (e:haxe.Exception) {
                NoselAPI.raiseNoselError(e);
            }
        } else {
            // REPL Mode
            Sys.println("NoselScript Haxe-Edition v.1.0.0");
            var buffer = "";
            
            while (true) {
                Sys.print(colors.prompt + (buffer == "" ? "> " : ">>> ") + colors.reset);
                var line = Sys.stdin().readLine();
                buffer += line + "\n";

                // Basic brace counting
                var open = buffer.split("{").length - 1;
                var close = buffer.split("}").length - 1;

                if (open <= close) {
                    try {
                        var out = transpile(buffer);
                        Sys.println(highlight("// Executing logic..."));
                        Sys.println(out);
                        buffer = "";
                    } catch (e:haxe.Exception) {
                        NoselAPI.raiseNoselError(e, true);
                        buffer = "";
                    }
                }
            }
        }
    }
}
