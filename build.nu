def main [] {
    print "Installing package 'pkg'..."
    try {
        npm install pkg
        print "Running 'npm run build'..."
        npm run build
        print "Build completed successfully."
    } catch {
        print -e "An error occurred during the process."
        exit 1
    }
}