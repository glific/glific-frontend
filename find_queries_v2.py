import os
import re

def find_use_query_on_completed(directory):
    files_with_issues = []
    
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r') as f:
                        content = f.read()
                        
                        # Use a simpler regex to find useQuery block first
                        # Then check if it contains onCompleted
                        
                        # Find all useQuery calls
                        for match in re.finditer(r'useQuery\s*\(', content):
                            start = match.start()
                            # Find end of call (matching parenthesis is hard, so look for next ); or usage of data)
                            # Let's just look at the next 1000 characters
                            block = content[start:start+1000]
                            # Check if it has onCompleted before the next useQuery, useMutation or useLazyQuery
                            
                            end_of_block = 1000
                            for stopper in [r'useQuery', r'useMutation', r'useLazyQuery']:
                                stopper_match = re.search(stopper, block[10:]) # skip the first useQuery
                                if stopper_match:
                                    end_of_block = min(end_of_block, stopper_match.start() + 10)
                            
                            if 'onCompleted' in block[:end_of_block]:
                                files_with_issues.append((path, start))
                except Exception as e:
                    print(f"Error reading {path}: {e}")
    
    return files_with_issues

issues = find_use_query_on_completed('.')
# Use a set to avoid duplicates if multiple matches on same file
seen = set()
for path, pos in issues:
    with open(path, 'r') as f:
        content = f.read()
        line_no = content[:pos].count('\n') + 1
        record = f"{path}:{line_no}"
        if record not in seen:
            print(record)
            seen.add(record)
