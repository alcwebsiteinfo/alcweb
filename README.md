# ALC Website

A member website for ALC with protected pages, member profiles, image and video galleries, and Google Sheets-backed member approval.

## Features

- Google Apps Script and Google Sheets member lookup.
- Login with an approved member ID.
- A 10-minute browser session that logs out automatically when it expires.
- Authentication required on every site page except the login page.
- Profile page showing the signed-in member's details.
- Member cards on the About page with `More Info` links.
- Logout buttons on the home page and personal profile page.
- Gallery loading in batches of 25 with a `Load more` button.
- Image preview, downloads, and drag-and-drop image uploads.
- Video cards with native playback controls and video modal playback.
- Responsive styling for desktop and mobile screens.

## Project Structure

```text
.
├── index.html              Login page
├── home.html               Member home page
├── about.html              Member cards and More Info links
├── profile.html            Authenticated member profile
├── gallery.html            Image and video gallery
├── photos.html             Photo-focused gallery
├── credits.html            Credits page
├── login.html              Redirect page for older login links
├── assets/
│   ├── auth.js             Authentication and session logic
│   ├── gallery.js          Gallery loading, batching, uploads, and playback
│   ├── gallery.css         Gallery styles
│   └── site.css            Shared site styles
├── media/
│   ├── image/              Website image files
│   ├── video/              Website video files
│   └── list.json           Generated image and video index
├── images/
│   └── pfp images/         Member profile pictures used by About and profiles
├── appscript/
│   ├── Code.gs             Google Apps Script endpoint
│   └── README.md           Apps Script setup instructions
├── scripts/
│   └── generate_list.py    Regenerates media/list.json
└── tests/
    └── auth-login.test.js  Login regression test
```

## Google Sheets Setup

The Apps Script uses the first tab of the spreadsheet. Put these headers in row 1:

| Column | Header | Purpose |
|---|---|---|
| A | `memberID` | Approved login ID |
| B | `displayName` | Name shown on the profile |
| C | `role` | Member role |
| D | `bio` | Member biography |
| E | `class` | Class or year |
| F | `status` | Member status |
| G | `photo` | Public image URL, preferably a Google Drive direct-view URL |

Add one member per row below the headers. The `memberID` must be unique.

Open **Extensions > Apps Script**, paste [appscript/Code.gs](appscript/Code.gs), and deploy it as a web app:

1. Set **Execute as** to yourself.
2. Set **Who has access** to anyone with the link.
3. Copy the deployed URL ending in `/exec`.
4. Set that URL as `window.ALC_AUTH_ENDPOINT` in [index.html](index.html).
5. Redeploy the Apps Script after changing `Code.gs`.

The endpoint accepts `?memberID=...` and returns an approval result plus profile data.

### Google Drive Profile Photos

For a Drive image:

1. Set sharing to **Anyone with the link > Viewer**.
2. Copy the file ID from the Drive URL.
3. Store a direct-view URL in column G:

```text
https://drive.google.com/uc?export=view&id=FILE_ID
```

This ID-only login is an approval lookup, not password authentication. It is not suitable for sensitive information. Use Google Identity Services or a secure backend with hashed passwords for real authentication.

## Media Management

Put gallery images in `media/image/`, videos in `media/video/`, and member profile pictures in `images/pfp images/`. Supported formats include:

- Images: PNG, JPG, JPEG, GIF, WEBP, BMP, and TIFF
- Videos: MP4, WEBM, OGG, and MOV

After adding or removing media, regenerate the index from the project root:

```bash
python3 scripts/generate_list.py
```

This writes `media/list.json`. The gallery reads this file and initially loads 25 media items. Each click on **Load more** loads the next 25 until everything is displayed.

## Local Development

This is a static website. Run a local server from the project root:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

A valid member session is required to open protected pages during browser testing.

## Validation

Run the login regression test and JavaScript checks:

```bash
node tests/auth-login.test.js
node --check assets/auth.js
node --check assets/gallery.js
node --check --input-type=commonjs < appscript/Code.gs
python3 -m json.tool media/list.json > /dev/null
```

## Authentication Details

Authentication state is stored in browser `localStorage`:

- `alcwebMember` stores the approved member ID.
- `alcwebMemberExpires` stores the session expiration time.
- `alcwebProfile` stores the profile returned by Apps Script.

The session expires after 10 minutes. Logout removes all three values and redirects to `index.html`. Static-page authentication is a client-side protection layer; it should not protect confidential data by itself.
