\# The NoselScript Programming Language

NoselScript is a programming language based on javascript that can convert to python

```
import io;
---

###### 

###### extend class FileManager {

###### &#x20;   constructor(directory) {

###### &#x20;       this.directory = directory;

###### &#x20;   }

###### 

###### &#x20;   setup() {

###### &#x20;       if (!io.exists(this.directory)) {

###### &#x20;           io.mkdir(this.directory);

###### &#x20;           logln("Directory initialized: " + this.directory);

###### &#x20;       }

###### &#x20;   }

###### 

###### &#x20;   saveLog(filename, content) {

###### &#x20;       try {

###### &#x20;           const fullPath = this.directory + "/" + filename;

###### &#x20;           io.write(fullPath, content);

###### &#x20;           logln("Log saved to: " + fullPath);

###### &#x20;       } catch (e) {

###### &#x20;           logln.error("Failed to save log: " + e);

###### &#x20;       }

###### &#x20;   }

###### 

###### &#x20;   checkNetwork() {

###### &#x20;       try {

###### &#x20;           logln("Running network check...");

###### &#x20;           const result = io.run("ping -c 1 google.com");

###### &#x20;           logln("Network status: " + result);

###### &#x20;       } catch (e) {

###### &#x20;           logln.warn("Network check failed.");

###### &#x20;       }

###### &#x20;   }

###### }

###### 

###### const manager = new FileManager("./logs");

###### manager.setup();

###### manager.saveLog("session.txt", "NoselScript session started.");

manager.checkNetwork();
```

Output

```
Log saved to: ./logs/session.txt
---

###### Running network check...

Network check failed.
```

# Stuff

im lazy to make this md
---

