"""Per page family: how much copy is repeated across its pages, and how readable it is. Reads corpus.json (corpus.py).

    python apps/web/scripts/content-audit/quality.py
"""
import collections
import json
import os
import re
import statistics as st

HERE = os.environ.get("OUT_DIR", os.path.dirname(os.path.abspath(__file__)))
pages = json.load(open(os.path.join(HERE, "corpus.json"), encoding="utf-8"))


def family(u):
    p = u.split("/")
    return "/" + p[1] if len(p) > 2 else ("/" if u == "/" else u)


def syll(w):
    n = len(re.findall(r"[aeiouy]+", w.lower()))
    if w.lower().endswith("e") and n > 1:
        n -= 1
    return max(1, n)


def flesch(text):
    sents = max(1, len(re.findall(r"[.!?]+(?:\s|$)", text)))
    words = re.findall(r"[A-Za-z']+", text)
    if not words:
        return 0
    return 206.835 - 1.015 * (len(words) / sents) - 84.6 * (sum(syll(w) for w in words) / len(words))


norm = lambda t: re.sub(r"[^a-z0-9 ]+", "", t.lower()).strip()
fam = collections.defaultdict(list)
for p in pages:
    fam[family(p["url"])].append(p)

rows = []
for f, ps in fam.items():
    cnt = collections.Counter()
    for p in ps:
        for t in {norm(t) for tag, t in p["blocks"] if len(t.split()) >= 8}:
            cnt[t] += 1
    for p in ps:
        blocks = [(tag, t) for tag, t in p["blocks"] if tag != "h1"]
        long_blocks = [norm(t) for tag, t in blocks if len(t.split()) >= 8]
        words_all = sum(len(t.split()) for _, t in blocks)
        shared = sum(len(b.split()) for b in long_blocks if len(ps) > 3 and cnt[b] >= max(3, len(ps) // 4))
        rows.append({
            "family": f, "url": p["url"], "words": words_all, "unique_words": max(0, words_all - shared),
            "boiler": shared / max(1, sum(len(b.split()) for b in long_blocks)),
            "flesch": flesch(" ".join(t for _, t in blocks)),
            "faq": "FAQPage" in " ".join(p["jsonld"]) or any("frequently asked" in t.lower() for tag, t in blocks if tag == "h2"),
            "ext": sum(1 for l in p["links"] if l.startswith("http")),
        })

print(f"{'family':16s} {'n':>3} {'words':>6} {'unique':>7} {'shared%':>8} {'flesch':>7} {'faq%':>5}")
for f in sorted(fam, key=lambda x: -len(fam[x])):
    r = [x for x in rows if x["family"] == f]
    if len(r) < 2:
        continue
    print(f"{f:16s} {len(r):3d} {st.median(x['words'] for x in r):6.0f} {st.median(x['unique_words'] for x in r):7.0f} "
          f"{100 * st.median(x['boiler'] for x in r):7.0f}% {st.median(x['flesch'] for x in r):7.0f} {100 * sum(x['faq'] for x in r) / len(r):4.0f}%")
json.dump(rows, open(os.path.join(HERE, "quality_rows.json"), "w"), ensure_ascii=False)
