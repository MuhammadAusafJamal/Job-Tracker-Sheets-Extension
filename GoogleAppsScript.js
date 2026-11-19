/**
 * Google Apps Script - Job Tracker Webhook
 * Supports dynamic Google Sheet URL / ID passed from Chrome Extension
 */

// Optional fallback: ID of your Google Sheet (found in URL: /spreadsheets/d/<SPREADSHEET_ID>/edit)
// Leave empty if deploying this script directly inside your target Google Sheet.
const DEFAULT_SPREADSHEET_ID = "";

function sanitizeCell(val) {
  if (typeof val !== 'string') return val;
  // Guard against spreadsheet formula injection (strings starting with =, +, -, @)
  if (/^[=\+\-\@\t\r]/.test(val)) {
    return "'" + val;
  }
  return val;
}

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
    if (targetId && targetId.trim() !== "") {
      try {
        ss = SpreadsheetApp.openById(targetId.trim());
      } catch (err) {
        ss = SpreadsheetApp.getActiveSpreadsheet();
      }
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    if (!ss) {
      throw new Error("Could not find or open target spreadsheet. Check your spreadsheet ID / permissions.");
    }

    var sheet = ss.getSheets()[0];
    var lastRow = sheet.getLastRow();
    var newRow = lastRow + 1;

    // Date Format: "Aug 15, 2026"
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var now = new Date();
    var formattedDate = months[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear();

    var company = sanitizeCell(data.company || "");
    var title = sanitizeCell(data.title || "");
    var jobType = sanitizeCell(data.jobType || "Full-time");
    var location = sanitizeCell(data.location || "Remote");
    var salaryOrBlank = sanitizeCell(data.salary || "");
    var status = sanitizeCell(data.status || "🟩 Applied");
    var followUp = sanitizeCell(data.followUp || "⏳ Not set");
    var platform = sanitizeCell(data.platform || "Website");
    var url = (data.url || "").trim();
    var resumeVer = sanitizeCell(data.resumeVersion || "V2");
    var notes = sanitizeCell(data.notes || "");

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

    // 2. Safely construct hyperlink formula (validate URL scheme and escape quotes)
    var linkFormula = "";
    if (url && (url.indexOf("http://") === 0 || url.indexOf("https://") === 0)) {
      var safeUrl = url.replace(/"/g, '""');
      var safePlatform = platform.replace(/"/g, '""');
      linkFormula = '=HYPERLINK("' + safeUrl + '", "' + safePlatform + ' Job Posting")';
    } else {
      linkFormula = sanitizeCell(url);
    }
    
    var rowValues = [
      [
        company,        // Col A: Company
        title,          // Col B: Job Title
        jobType,        // Col C: Job Type
        location,       // Col D: Location
        salaryOrBlank,  // Col E: Salary
        status,         // Col F: Status Dropdown
        followUp,       // Col G: Follow-up Dropdown
        linkFormula,    // Col H: Hyperlink Formula
        resumeVer,      // Col I: Resume Version
        formattedDate,  // Col J: Date Added
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
