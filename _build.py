#!/usr/bin/env python3
"""Build script for Vercel — combine layout + content fragments into full HTML pages."""
import os, json, re
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent
LAYOUT = ROOT / "_layout.html"
CONTENT_DIR = ROOT / "artikel" / "_content"
OUTPUT_DIR = ROOT / "artikel"

def build():
    now = datetime.now()
    year = now.year
    
    if not LAYOUT.exists():
        print("❌ _layout.html not found")
        return False
    
    layout = LAYOUT.read_text(encoding="utf-8")
    
    if not CONTENT_DIR.exists():
        print("ℹ️  No content fragments found")
        CONTENT_DIR.mkdir(parents=True, exist_ok=True)
        return True
    
    count = 0
    for f in sorted(CONTENT_DIR.glob("*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            slug = f.stem  # filename without .json
            title = data.get("title", "Artikel")
            desc = data.get("desc", "Artikel dari Guru Affiliate")
            badge = data.get("badge", "📖 Artikel")
            meta = data.get("meta", "")
            content_html = data.get("content", "<p>Konten tidak tersedia.</p>")
            note = data.get("note", f"Artikel otomatis oleh SOUL Agent · {now.strftime('%d %b %Y')}")
            url = f"/artikel/{slug}"
            
            page = layout
            page = page.replace("{TITLE}", title)
            page = page.replace("{DESC}", desc)
            page = page.replace("{URL}", url)
            page = page.replace("{BADGE}", badge)
            page = page.replace("{META}", meta)
            page = page.replace("{CONTENT}", content_html)
            page = page.replace("{NOTE}", note)
            page = page.replace("{YEAR}", str(year))
            
            # Create output folder
            out_dir = OUTPUT_DIR / slug
            out_dir.mkdir(parents=True, exist_ok=True)
            (out_dir / "index.html").write_text(page, encoding="utf-8")
            
            print(f"✅ Built: artikel/{slug}/index.html ({len(page)} bytes)")
            count += 1
            
            # Remove processed content fragment
            f.unlink()
            
        except Exception as e:
            print(f"❌ Error building {f.name}: {e}")
    
    print(f"\n📦 Total: {count} article(s) built")
    return True

if __name__ == "__main__":
    build()
