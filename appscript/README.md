# Google Sheets login setup

1. Create a Google Sheet. The script uses the first tab.
2. Put `memberID` in cell `A1` and one approved ID per row below it.
3. In the Sheet, open **Extensions > Apps Script**, paste the contents of `Code.gs`, and save.
4. Deploy as a web app. Set **Execute as** to you and **Who has access** to anyone with the link.
5. Copy the deployed `/exec` URL into `window.ALC_AUTH_ENDPOINT` in `index.html`.

The endpoint accepts `?memberID=...` and returns JSON with `authenticated` and `memberID`.

This ID-only approach is an approval lookup, not password authentication. Do not use it for sensitive data. For real authentication, use Google Identity Services or a backend that stores password hashes and issues secure sessions.