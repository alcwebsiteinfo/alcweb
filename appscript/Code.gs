function doGet(e) {
  const memberID = String(e.parameter.memberID || '').trim();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = sheet.getLastRow();
  const rows = lastRow < 1 ? [] : sheet.getRange(1, 1, lastRow, 11).getDisplayValues();
  const headers = rows.length ? rows.shift().map((header) => header.trim().toLowerCase()) : [];
  const memberIndex = headers.indexOf('memberid');
  const row = rows.find((values) => memberIndex >= 0 && values[memberIndex].trim() === memberID);
  if (e.parameter.action === 'saveTheme' && row && memberID) {
    const theme = e.parameter.theme === 'dark' ? 'dark' : 'light';
    const themeIndex = headers.indexOf('theme');
    if (themeIndex >= 0) {
      const rowNumber = rows.indexOf(row) + 2;
      sheet.getRange(rowNumber, themeIndex + 1).setValue(theme);
    }
    return ContentService
      .createTextOutput(JSON.stringify({ saved: true, theme }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const profile = row ? {
    memberID: row[memberIndex],
    displayName: row[headers.indexOf('displayname')] || row[memberIndex],
    role: row[headers.indexOf('role')] || 'ALC Member',
    bio: row[headers.indexOf('bio')] || '',
    class: row[headers.indexOf('class')] || '',
    status: row[headers.indexOf('status')] || 'Approved member',
    photo: row[headers.indexOf('photo')] || '',
    theme: row[headers.indexOf('theme')] === 'dark' ? 'dark' : 'light',
    birthDate: row[headers.indexOf('birthdate')] || '',
    email: row[headers.indexOf('email')] || '',
    whatsapp: row[headers.indexOf('whatsapp')] || ''
  } : null;
  const authenticated = Boolean(profile);
  return ContentService
    .createTextOutput(JSON.stringify({ authenticated, memberID: authenticated ? memberID : '', profile }))
    .setMimeType(ContentService.MimeType.JSON);
}
