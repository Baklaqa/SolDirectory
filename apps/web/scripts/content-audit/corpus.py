"""Fetch every page in sitemap-pages.xml (the crawler HTML, which is what search engines index) and save each page's text
blocks, links and metadata to corpus.json next to this script.

    python apps/web/scripts/content-audit/corpus.py          # BASE=https://staging... to point elsewhere
"""
import concurrent.futures
import html
import json
import os
import re
import sys
import urllib.request

BASE = os.environ.get("BASE", "https://directory.solbusinessconsultant.com.au")
OUT = os.environ.get("OUT_DIR", os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "Mozilla/5.0 (content-audit)", "Accept-Encoding": "identity"}


def get(u):
    for _ in range(3):
        try:
            return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read().decode("utf-8", "replace")
        except Exception:
            pass
    return None


urls = re.findall(r"<loc>([^<]+)</loc>", get(BASE + "/sitemap-pages.xml") or "")


def one(u):
    s = get(u)
    if not s:
        return None
    g = lambda p: html.unescape((re.search(p, s, re.S) or [None, ""])[1] or "")
    main = re.search(r"<main data-seo-shell>(.*)</main>", s, re.S)
    body = re.sub(r"<style.*?</style>", "", main.group(1) if main else "", flags=re.S)
    blocks = []
    for m in re.finditer(r"<(h[1-6]|p|li|dt|dd)[^>]*>(.*?)</\1>", body, re.S):
        t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", m.group(2)))).strip()
        if t:
            blocks.append([m.group(1), t])
    return {
        "url": u.replace(BASE, "") or "/",
        "title": g(r"<title>([^<]*)"),
        "desc": g(r'<meta name="description" content="([^"]*)"'),
        "blocks": blocks,
        "links": re.findall(r'<a href="([^"]+)"', body),
        "jsonld": re.findall(r'id="jsonld-([a-z0-9-]+)"', s),
    }


with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    pages = [p for p in ex.map(one, urls) if p]
with open(os.path.join(OUT, "corpus.json"), "w", encoding="utf-8") as fh:
    json.dump(pages, fh, ensure_ascii=False)
print(len(pages), "pages;", sum(len(p["blocks"]) for p in pages), "blocks", file=sys.stderr)
