import glob, os

chars = set()
pats = ['source/**/*.md', 'themes/j3rk/**/*.ejs', 'themes/j3rk/_config.yml', 'E:/workspace/mass_round2/**/*.md', 'E:/workspace/DNGuardKiller/**/*.md']
for pat in pats:
    for f in glob.glob(pat, recursive=True):
        try:
            chars |= set(open(f, encoding='utf-8', errors='replace').read())
        except Exception:
            pass

# ASCII + common punctuation
extra = ''.join(chr(c) for c in range(0x20, 0x7f))
extra += "。，！？；：“”‘’（）【】《》、·—…％￥#@&*+-=/\\|~^_$[]{}<>"
# common Chinese chars (high-frequency filler, in case new text)
extra += "年月日时分秒第上下左右前后大小多少新旧高低长短快慢好坏是否对错无没有这那么怎为什因所以但如果否则虽然可是而且还也很都太真更最非常特别十分"
chars |= set(extra)

chars = {c for c in chars if 0x20 <= ord(c) < 0x10000}
open('_subset_chars.txt', 'w', encoding='utf-8').write(''.join(sorted(chars)))
print("subset chars:", len(chars))
