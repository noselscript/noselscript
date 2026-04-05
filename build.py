import subprocess
import sys

def run_npm_commands():
    try:
        # Install the package
        print("Installing package 'pkg'...")
        subprocess.run(["npm", "install", "pkg"], check=True)
        
        # Run the build script
        print("Running 'npm run build'...")
        subprocess.run(["npm", "run", "build"], check=True)
        
        print("Build completed successfully.")
        
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while executing npm: {e}", file=sys.stderr)
    except FileNotFoundError:
        print("Error: 'npm' command not found. Please ensure Node.js/npm is installed and in your PATH.", file=sys.stderr)

if __name__ == "__main__":
    run_npm_commands()