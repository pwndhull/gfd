# Local smoke test: swaps CDN React for local UMD files and reports runtime errors.
import sys, re, pathlib
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).parent
html = (root/'dist/index.html').read_text()
r = (root/'node_modules/react/umd/react.production.min.js').read_text()
rd = (root/'node_modules/react-dom/umd/react-dom.production.min.js').read_text()
html = re.sub(r'<script src="https://cdnjs[^"]+react\.production\.min\.js"></script>', lambda m: '<script>'+r+'</script>', html)
html = re.sub(r'<script src="https://cdnjs[^"]+react-dom\.production\.min\.js"></script>', lambda m: '<script>'+rd+'</script>', html)
html = re.sub(r'<link[^>]+fonts[^>]+>', '', html)
out = pathlib.Path('/tmp/claude-0/-home-claude/b1d84df9-2e1c-53b2-a298-78d43cc3a8d1/scratchpad/local.html')
out.write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0">'+html+'</body></html>')
hashes = sys.argv[1:] or ['#home']
errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1400, 'height': 900})
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    for h in hashes:
        pg.goto('file://' + str(out) + h)
        pg.wait_for_timeout(400)
        txt = pg.inner_text('body')[:120].replace('\n', ' | ')
        print(h, '->', txt)
    b.close()
print('ERRORS:', errors[:10] if errors else 'none')
