import api.NoselApi; // Importing your API module
import sys.io.File;
import sys.FileSystem;
import haxe.io.Path;

class Repl {
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
        return rNumbers.replace(code, colors.number + "$1" + colors.reset);
    }

    static function transpile(code:String):String {
        // Handle imports
        var rImport = ~/import\s+([\w.]+);/g;
        code = rImport.map(code, function(re) {
            var dotPath = re.matched(1);
            var parts = dotPath.split(".");
            var name = parts[parts.length - 1];
            
            if (name == "io") return "var io = NoselApi.io;";

            var targetPath = Path.join([NoselApi.currentDir, parts.join("/")]) + ".ns";
            // Escaping path for the generated code
            return 'var $name = loadNoselModule("${StringTools.replace(targetPath, "\\", "\\\\")}");';
        });

        code = StringTools.replace(code, "extend class", "class");
        code = StringTools.replace(code, "exports =", "module.exports =");
        code = StringTools.replace(code, "logln", "NoselApi.logln");
        
        return code;
    }

    static function main() {
        var args = Sys.args();

        if (args.length > 0) {
            var filePath = Path.normalize(args[0]);
            if (!FileSystem.exists(filePath)) {
                Sys.println('\x1b[31mError: Script not found at $filePath\x1b[0m');
                Sys.exit(1);
            }

            NoselApi.currentDir = Path.directory(filePath);
            try {
                var content = File.getContent(filePath);
                Sys.println(transpile(content)); 
            } catch (e:haxe.Exception) {
                NoselApi.raiseNoselError(e, false);
            }
        } else {
            Sys.println("NoselScript Haxe-Edition v.1.0.0");
            Sys.println("A programming language with an ide, conversion to python, etc.");
            
            var buffer = "";
            while (true) {
                var isMulti = buffer != "";
                Sys.print('${colors.prompt}${isMulti ? ">>>" : ">"}${colors.reset} ');
                
                try {
                    var line = Sys.stdin().readLine();
                    buffer += line + "\n";

                    var open = buffer.split("{").length - 1;
                    var close = buffer.split("}").length - 1;

                    if (open <= close) {
                        if (StringTools.trim(buffer) != "") {
                            var result = transpile(buffer);
                            Sys.println(highlight(result));
                        }
                        buffer = "";
                    }
                } catch (e:haxe.io.Eof) {
                    break; // Exit on Ctrl+C/D
                } catch (e:haxe.Exception) {
                    NoselApi.raiseNoselError(e, true);
                    buffer = "";
                }
            }
        }
    }
}
