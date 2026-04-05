# The NoselScript Programming Language

NoselScript is a programming language based on javascript that can convert to python

```
import io;

extend class FileManager {
    constructor(directory) {
        this.directory = directory;
    }

    setup() {
        if (!io.exists(this.directory)) {
            io.mkdir(this.directory);
            logln("Directory initialized: " + this.directory);
        }
    }

    saveLog(filename, content) {
        try {
            const fullPath = this.directory + "/" + filename;
            io.write(fullPath, content);
            logln("Log saved to: " + fullPath);
        } catch (e) {
            logln.error("Failed to save log: " + e);
        }
    }

    checkNetwork() {
        try {
            logln("Running network check...");
            const result = io.run("ping -c 1 google.com");
            logln("Network status: " + result);
        } catch (e) {
            logln.warn("Network check failed.");
        }
    }
}

const manager = new FileManager("./logs");
manager.setup();
manager.saveLog("session.txt", "NoselScript session started.");
manager.checkNetwork();
```

Output

```
Log saved to: ./logs/session.txt
 Running network check...
Network check failed.
```

# Stuff

im lazy to make this md
---

