import sys
from playwright.sync_api import sync_playwright
out='/tmp/claude-0/-home-claude/b1d84df9-2e1c-53b2-a298-78d43cc3a8d1/scratchpad/'
with sync_playwright() as p:
    b = p.chromium.launch()
    for (h, w, ht, name, scroll) in [(a.split(',')[0], int(a.split(',')[1]), int(a.split(',')[2]), a.split(',')[3], int(a.split(',')[4]) if len(a.split(','))>4 else 0) for a in sys.argv[1:]]:
        pg = b.new_page(viewport={'width': w, 'height': ht})
        pg.goto('file://' + out + 'local.html' + h)
        pg.wait_for_timeout(500)
        if scroll: pg.evaluate(f'window.scrollTo(0,{scroll})'); pg.wait_for_timeout(200)
        pg.screenshot(path=out + name + '.png')
    b.close()
