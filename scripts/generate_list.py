#!/usr/bin/env python3
"""Utility to regenerate images/list.json from the contents of the images/ directory.

Run this script from the repository root whenever new pictures are added.  It will
list all common raster image files (jpg, png, gif, etc.) and produce a sorted
JSON array that mirrors the manual format currently stored in ``images/list.json``.

Usage:
    python3 scripts/generate_list.py

The script overwrites ``images/list.json`` so make sure you have a backup or
commit any changes to version control before running.
"""

import os
import json
import urllib.parse

IMG_DIR = 'images'
LIST_FILE = os.path.join(IMG_DIR, 'list.json')

EXTENSIONS = ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff')


def main():
    entries = []
    for fname in sorted(os.listdir(IMG_DIR)):
        if fname == 'list.json':
            continue
        if fname.lower().endswith(EXTENSIONS):
            url = IMG_DIR + '/' + urllib.parse.quote(fname)
            entries.append({'url': url, 'name': fname})

    with open(LIST_FILE, 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2)
        f.write('\n')

    print(f"wrote {len(entries)} entries to {LIST_FILE}")


if __name__ == '__main__':
    main()
