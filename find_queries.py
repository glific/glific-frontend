import os
import re

def find_on_completed_in_use_query(directory):
    pattern = re.compile(r'useQuery\s*\([^)]+\)', re.DOTALL)
    on_completed_pattern = re.compile(r'onCompleted\s*:')
    
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                for match in pattern.finditer(content):
                    query_call = match.group(0)
                    if on_completed_pattern.search(query_call):
                        print(f"Found in {path}:")
                        print(query_call)
                        print("-" * 20)

if __name__ == "__main__":
    find_on_completed_in_use_query('.')
