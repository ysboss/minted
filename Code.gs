function doGet(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var data = rows.slice(1).map(function(row) {
      var obj = {};
      row.forEach(function(cell, i) {
        // Convert headers to lowercase keys for JSON
        obj[headers[i].toLowerCase()] = cell; 
      });
      return obj;
    });

    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": e }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Validating header row if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Date", "Type", "Category", "Amount", "Description"]);
    }

    sheet.appendRow([
      new Date(),
      data.date,
      data.type,
      data.category,
      data.amount,
      data.description
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": e }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
