@echo off
echo Installing package 'pkg'...
call npm install pkg
if %errorlevel% neq 0 (
    echo Installation failed!
    exit /b %errorlevel%
)

echo Running 'npm run build'...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b %errorlevel%
)

echo Build completed successfully.
pause