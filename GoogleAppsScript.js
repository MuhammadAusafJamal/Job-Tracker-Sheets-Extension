/**
 * Google Apps Script - Job Tracker Webhook
 * Supports dynamic Google Sheet URL / ID passed from Chrome Extension
 */

const DEFAULT_SPREADSHEET_ID = "1qGDNaaXIq0kEOxhhezXKxAFHd4pWqapF_tenbaiGYRI";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var targetId = data.spreadsheetId || DEFAULT_SPREADSHEET_ID;

    var ss;
    try {
      ss = SpreadsheetApp.openById(targetId);
    } catch (err) {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    if (!ss) {
      throw new Error("Could not find spreadsheet with ID: " + targetId);
    }

    var sheet = ss.getSheets()[0];
    var lastRow = sheet.getLastRow();
    var newRow = lastRow + 1;

    // Date Format: "Aug 15, 2026"
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var now = new Date();
    var formattedDate = months[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear();

    var company = data.company || "";
    var title = data.title || "";
    var jobType = data.jobType || "Full-time";
    var location = data.location || "Remote";
    var salaryOrBlank = data.salary || "";
    var status = data.status || "🟩 Applied";
    var followUp = data.followUp || "⏳ Not set";
    var platform = data.platform || "Website";
    var url = data.url || "";
    var resumeVer = data.resumeVersion || "V2";
    var notes = data.notes || "";

    // Normalize emoji chips
    if (status === "Applied") status = "🟩 Applied";
    if (followUp === "Not set") followUp = "⏳ Not set";

    // 1. Inherit format, colors, borders & dropdowns from row above
    if (lastRow >= 2) {
      var sourceRange = sheet.getRange(lastRow, 1, 1, 11);
      var targetRange = sheet.getRange(newRow, 1, 1, 11);
      sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
      sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    }

    // 2. Set Row Values (Col A to Col K)
    var linkFormula = url ? '=HYPERLINK("' + url + '", "' + platform + ' Job Posting")' : "";
    
    var rowValues = [
      [
        company,        // Col A: Company (Yellow)
        title,          // Col B: Job Title
        jobType,        // Col C: Job Type (Pink)
        location,       // Col D: Location
        salaryOrBlank,  // Col E: (Blank)
        status,         // Col F: Dropdown (🟩 Applied)
        followUp,       // Col G: Dropdown (⏳ Not set)
        linkFormula,    // Col H: Hyperlink
        resumeVer,      // Col I: Resume Version (V2)
        formattedDate,  // Col J: Date (Aug 15, 2026)
        notes           // Col K: Notes
      ]
    ];

    sheet.getRange(newRow, 1, 1, 11).setValues(rowValues);

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      row: newRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Webhook active").setMimeType(ContentService.MimeType.TEXT);
}
