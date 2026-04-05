package API {
    public class NoselApi {
        public static var currentDir:String = "";
        
        public static const colors:Object = {
            reset: "\x1b[0m",
            filename: "\x1b[94m",
            lineCollum: "\x1b[34m",
            errorType: "\x1b[31m",
            reason: "\x1b[33m"
        };

        // Simulated IO object
        public static var io:Object = {
            run: function(cmd:String):String {
                // Implementation depends on CLI host (e.g., Redtamarin shell.execute)
                return "Command execution not supported in vanilla AS3";
            },
            exists: function(path:String):Boolean {
                return false; // Requires FileSystem API
            }
        };

        public static function logln(...args):void {
            trace(args.join(" "));
        }

        public static function raiseNoselError(err:Error, isRepl:Boolean = false):void {
            var fileName:String = isRepl ? "REPL" : "unknown";
            var type:String = err.name;
            var reason:String = err.message;

            var formatted:String = colors.filename + fileName + colors.reset + ":" +
                                  colors.errorType + type + colors.reset + ":" +
                                  colors.reason + reason + colors.reset;
            
            trace(formatted);
        }
    }
}
