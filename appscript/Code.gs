function doGet(e) {
  const memberID = String(e.parameter.memberID || '').trim();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = sheet.getLastRow();
  const memberIDs = lastRow < 2
    ? []
    : sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().flat().map((value) => value.trim());

  const authenticated = Boolean(memberID && memberIDs.includes(memberID));
  return ContentService
    .createTextOutput(JSON.stringify({ authenticated, memberID: authenticated ? memberID : '' }))
    .setMimeType(ContentService.MimeType.JSON);
}
