#!/usr/bin/env python3
"""Utility to regenerate media/list.json from the media image and video directories.

Run this script from the repository root whenever new pictures are added.  It will
    list all common image and video files and produce a sorted JSON array stored in
    ``media/list.json``.

Usage:
    python3 scripts/generate_list.py

    The script overwrites ``media/list.json`` so make sure you have a backup or
commit any changes to version control before running.
"""

import os
import json
import urllib.parse

MEDIA_DIR = 'media'
LIST_FILE = os.path.join(MEDIA_DIR, 'list.json')

EXTENSIONS = ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff', '.mp4', '.webm', '.ogg', '.mov')


def main():
    entries = []
    for media_type in ('image', 'video'):
        media_dir = os.path.join(MEDIA_DIR, media_type)
        for fname in sorted(os.listdir(media_dir)):
            if fname.lower().endswith(EXTENSIONS):
                url = f'{MEDIA_DIR}/{media_type}/{urllib.parse.quote(fname)}'
                entries.append({'url': url, 'name': fname, 'type': media_type})

    with open(LIST_FILE, 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2)
        f.write('\n')

    print(f"wrote {len(entries)} entries to {LIST_FILE}")


if __name__ == '__main__':
    main()
