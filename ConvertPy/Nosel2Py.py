import os
import re

def transpile_to_py(content):
    # 1. Add the required Header
    header = "# // Generated from the NoselScript Python Converter\n\n"
    
    # 2. Handle the "exports = { greet: (name) => { ... } }" logic
    # This identifies property: (args) => { body }
    export_pattern = r'(\w+):\s*\((.*?)\)\s*=>\s*\{([\s\S]*?)\}'
    
    def convert_export_match(match):
        func_name = match.group(1)
        args = match.group(2)
        body = match.group(3).strip()
        # Convert logln to print inside the function body
        body = re.sub(r'logln\((.*?)\)', r'print(\1)', body)
        # Indent the body for Python
        indented_body = "\n    ".join(body.split('\n'))
        return f"def {func_name}({args}):\n    {indented_body}"

    # Process exports object if it exists
    if "exports =" in content:
        content = re.sub(export_pattern, convert_export_match, content)
        # Remove the shell of the JS object
        content = re.sub(r'exports\s*=\s*\{', '', content)
        content = re.sub(r'\};', '', content)

    # 3. General Syntax Swaps
    content = re.sub(r'logln\.error\((.*?)\)', r'print("ERROR:", \1)', content)
    content = re.sub(r'logln\.warn\((.*?)\)', r'print("WARNING:", \1)', content)
    content = re.sub(r'logln\((.*?)\)', r'print(\1)', content)
    content = re.sub(r'extend\s+class\s+(\w+)', r'class \1:', content)
    
    # 4. Correct Import Logic: import API.utils; -> from API import utils
    def fix_imports(m):
        path = m.group(1)
        if '.' in path:
            parts = path.rsplit('.', 1)
            return f"from {parts[0]} import {parts[1]}"
        return f"import {path}"

    content = re.sub(r'import\s+([\w.]+);', fix_imports, content)

    # 5. Remove JS noise
    content = re.sub(r'\b(const|let|var)\s+', '', content)
    content = re.sub(r'new\s+(\w+)\(\)', r'\1()', content)

    return header + content.strip()

def convert_project(src_dir, dest_dir):
    # Ensure source directory exists
    if not os.path.exists(src_dir):
        print(f"Source directory {src_dir} not found.")
        return

    for root, dirs, files in os.walk(src_dir):
        # Prevent infinite loops if output is inside project
        if 'python_output' in root or 'node_modules' in root:
            continue 
        
        for file in files:
            if file.endswith('.ns'):
                src_path = os.path.join(root, file)
                rel_path = os.path.relpath(src_path, src_dir)
                dest_path = os.path.join(dest_dir, rel_path.replace('.ns', '.py'))
                
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                
                try:
                    with open(src_path, 'r', encoding='utf-8') as f:
                        py_code = transpile_to_py(f.read())
                        with open(dest_path, 'w', encoding='utf-8') as out:
                            out.write(py_code)
                    print(f"Successfully Converted: {src_path} -> {dest_path}")
                except Exception as e:
                    print(f"Failed to convert {src_path}: {e}")

if __name__ == "__main__":
    # Create the output folder if it doesn't exist
    convert_project('.', './python_output')