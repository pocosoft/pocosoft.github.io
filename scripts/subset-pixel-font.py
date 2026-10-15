"""DotGothic16 を、サイトで使う文字だけに絞った1つのフォントファイルにする。

Fontsource の DotGothic16 は日本語が約120個のファイルに分かれていて、CSS だけで 100KB を超える。
そこで src/ の文言に出てくる文字（＋ASCII と記号）だけを残して1つの WOFF にまとめる。
文言を変えて新しい文字が増えたら、このスクリプトを実行し直してコミットする。
（npm run build の後の検査で、足りない文字があれば失敗する）

    python3 scripts/subset-pixel-font.py

必要なもの: fonttools（pip install fonttools）
"""
import glob
import pathlib
import re
import tempfile

from fontTools import subset
from fontTools.merge import Merger
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'node_modules/@fontsource/dotgothic16'
OUT_FONT = ROOT / 'src/assets/fonts/dotgothic16-subset.woff'
OUT_CHARS = ROOT / 'src/assets/fonts/dotgothic16-subset.chars.txt'

# サイトの文言に出てくる文字
chars = set()
for path in list(ROOT.glob('src/**/*.astro')) + list(ROOT.glob('src/**/*.ts')):
    chars.update(path.read_text(encoding='utf-8'))
# ASCII と、よく使う記号は文言に無くても入れておく
chars.update(chr(c) for c in range(0x20, 0x7F))
chars.update('、。・「」『』（）！？ー〜…―▶▼◀▲●○■□★☆→←↑↓×÷％＆＋－＝／：；＜＞')
chars = {c for c in chars if c.isprintable() and c not in '\t\r\n'}

# unicode-range を読み、使う文字を含むファイルだけを選ぶ
css = (SRC / '400.css').read_text(encoding='utf-8')
blocks = re.findall(r'@font-face\s*{([^}]*)}', css)

def parse_ranges(text):
    out = []
    for part in text.split(','):
        part = part.strip().removeprefix('U+')
        if '-' in part:
            a, b = part.split('-')
            out.append((int(a, 16), int(b, 16)))
        elif '?' in part:
            out.append((int(part.replace('?', '0'), 16), int(part.replace('?', 'F'), 16)))
        else:
            out.append((int(part, 16), int(part, 16)))
    return out

codepoints = {ord(c) for c in chars}
pieces = []
with tempfile.TemporaryDirectory() as tmp:
    for i, block in enumerate(blocks):
        m_url = re.search(r"url\(\./files/([^)]+?)\.woff2\)", block)
        m_range = re.search(r'unicode-range:\s*([^;]+);', block)
        if not m_url or not m_range:
            continue
        ranges = parse_ranges(m_range.group(1))
        wanted = sorted(cp for cp in codepoints if any(a <= cp <= b for a, b in ranges))
        if not wanted:
            continue
        font = TTFont(SRC / 'files' / f'{m_url.group(1)}.woff')
        cmap = font.getBestCmap()
        wanted = [cp for cp in wanted if cp in cmap]
        if not wanted:
            continue
        options = subset.Options()
        options.layout_features = ['*']
        options.notdef_outline = True
        sub = subset.Subsetter(options)
        sub.populate(unicodes=wanted)
        sub.subset(font)
        font.flavor = None
        out = pathlib.Path(tmp) / f'{i}.ttf'
        font.save(out)
        pieces.append(str(out))

    merged = Merger().merge(pieces)
    merged.flavor = 'woff'
    merged.save(OUT_FONT)

covered = sorted(chr(cp) for cp in TTFont(OUT_FONT).getBestCmap())
OUT_CHARS.write_text(''.join(covered), encoding='utf-8')
missing = sorted(c for c in chars if ord(c) not in TTFont(OUT_FONT).getBestCmap() and ord(c) > 0x20)
print(f'{OUT_FONT.relative_to(ROOT)}: {OUT_FONT.stat().st_size // 1024}KB, {len(covered)} 文字（元のファイル {len(pieces)} 個から）')
if missing:
    print(f'フォントに無い文字（端末のフォントで表示される）: {"".join(missing)}')
