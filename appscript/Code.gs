function doGet(e) {
  const memberID = String(e.parameter.memberID || '').trim();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = sheet.getLastRow();
  const rows = lastRow < 1 ? [] : sheet.getRange(1, 1, lastRow, 7).getDisplayValues();
  const headers = rows.length ? rows.shift().map((header) => header.trim().toLowerCase()) : [];
  const memberIndex = headers.indexOf('memberid');
  const row = rows.find((values) => memberIndex >= 0 && values[memberIndex].trim() === memberID);
  const profile = row ? {
    memberID: row[memberIndex],
    displayName: row[headers.indexOf('displayname')] || row[memberIndex],
    role: row[headers.indexOf('role')] || 'ALC Member',
    bio: row[headers.indexOf('bio')] || '',
    class: row[headers.indexOf('class')] || '',
    status: row[headers.indexOf('status')] || 'Approved member',
    photo: row[headers.indexOf('photo')] || ''
  } : null;
  const authenticated = Boolean(profile);
  return ContentService
    .createTextOutput(JSON.stringify({ authenticated, memberID: authenticated ? memberID : '', profile }))
    .setMimeType(ContentService.MimeType.JSON);
}
