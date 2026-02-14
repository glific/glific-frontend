import os
import re

def replace_in_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Remove addTypename={false} with optional spaces
    new_content = re.sub(r'\s*addTypename=\{false\}', '', content)
    
    # Remove addTypename: false from object literals
    new_content = re.sub(r'addTypename:\s*false,?', '', new_content)
    
    # Remove canonizeResults: true from object literals
    new_content = re.sub(r'canonizeResults:\s*true,?', '', new_content)
    
    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

def main():
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                file_path = os.path.join(root, file)
                replace_in_file(file_path)

if __name__ == "__main__":
    main()
