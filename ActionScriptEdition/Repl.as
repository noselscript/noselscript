package {
    import API.NoselApi;
    
    public class Repl {
        private static const colors:Object = {
            reset: "\x1b[0m",
            keyword: "\x1b[33;1m",
            string: "\x1b[32m",
            number: "\x1b[36m",
            prompt: "\x1b[35;1m"
        };

        public function Repl() {
            // Main Entry Logic
            var args:Array = []; // In Redtamarin: shell.arguments
            
            if (args.length > 0) {
                runFile(args[0]);
            } else {
                startRepl();
            }
        }

        private static function highlight(code:String):String {
            var kw:RegExp = /\b(extend class|import|const|let|var|function|return|exports)\b/g;
            var str:RegExp = /(".+?"|'.+?'|`.+?`)/g;
            var num:RegExp = /\b(\d+)\b/g;

            code = code.replace(kw, colors.keyword + "$1" + colors.reset);
            code = code.replace(str, colors.string + "$1" + colors.reset);
            code = code.replace(num, colors.number + "$1" + colors.reset);
            return code;
        }

        private static function transpile(code:String):String {
            // Import logic using RegExp.exec or replace
            var importPattern:RegExp = /import\s+([\w.]+);/g;
            
            var result:String = code.replace(importPattern, function():String {
                var dotPath:String = arguments[1];
                var parts:Array = dotPath.split(".");
                var name:String = parts[parts.length - 1];

                if (name == "io") return "var io = NoselApi.io;";
                
                // AS3 requires manual path building
                var targetPath:String = parts.join("/") + ".ns";
                return "var " + name + " = require(\"" + targetPath + "\");";
            });

            result = result.replace(/extend\s+class/g, "class");
            result = result.replace(/exports\s*=\s*/g, "module.exports = ");
            result = result.replace(/\blogln\b/g, "NoselApi.logln");
            
            return result;
        }

        private function startRepl():void {
            trace("NoselScript ActionScript-Edition v.1.0.0");
            // Note: AS3 is event-based; a CLI REPL requires 
            // a library to block and read Stdin synchronously.
            
            var buffer:String = "";
            // Pseudocode for the loop:
            // while(true) { 
            //    print prompt, read line, transpile(buffer), trace(highlight(result))
            // }
        }

        private function runFile(path:String):void {
            try {
                // var code:String = FileSystem.read(path);
                // eval(transpile(code)); 
                // Note: AS3 does not have a native 'eval()' at runtime 
                // unless using a library like D.eval or hscript-as3.
            } catch (err:Error) {
                NoselApi.raiseNoselError(err, false);
            }
        }
    }
}
