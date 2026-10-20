"""Developer convenience only. Delivered index.html is already self-contained."""
from pathlib import Path
import re
root = Path(__file__).resolve().parent.parent
html = (root / 'tools/index.template.html').read_text()
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + (root / 'style.css').read_text() + '</style>')
def inline(match):
    code = (root / match[1]).read_text()
    code = re.sub(r'</script', r'<\\/script', code, flags=re.I)
    return '<script>\n' + code + '\n</script>'
html = re.sub(r'<script src="([^"]+)"></script>', inline, html)
(root / 'index.html').write_text(html)
print('Built offline index.html:', len(html.encode()), 'bytes')
