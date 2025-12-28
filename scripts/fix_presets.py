
import re

file_path = 'src/app/components/studio/presets.ts'

with open(file_path, 'r') as f:
    content = f.read()

# Pattern: match type: 'text' ... color: 'X' ... and capture X
# We assume the object is on one line or close enough. The previous view showed one-liners.
# We'll use a regex that looks for "type: 'text'" and "color: '...'" in the same block.
# Since lines are single-line objects in the array:
# { id: 'title', type: 'text', ... color: '#FFFFFF', ... }

def replacement(match):
    full_match = match.group(0)
    color_val = match.group(1)
    # Check if fill is already present to avoid duplication (though previous inspection suggests not)
    if 'fill:' in full_match:
        return full_match
    return full_match.replace(f"color: '{color_val}'", f"color: '{color_val}', fill: '{color_val}'")

# Regex: look for lines containing type: 'text' and color: '...'
# We iterate line by line to be safe.
lines = content.split('\n')
new_lines = []
for line in lines:
    if "type: 'text'" in line and "color: '" in line:
        # Extract color
        # This simple regex assumes the format found in the file: color: '#HEX'
        new_line = re.sub(r"color: '([^']*)'", lambda m: f"color: '{m.group(1)}', fill: '{m.group(1)}'", line)
        new_lines.append(new_line)
    else:
        new_lines.append(line)

with open(file_path, 'w') as f:
    f.write('\n'.join(new_lines))

print(f"Processed {len(lines)} lines.")
