# Changelog

All notable changes to the **Job-Tracker-Sheets-Extension** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-11-19

### Added
- **1-Click Google Sheet Template Onboarding**: Dedicated button and copy URL in settings (`https://docs.google.com/spreadsheets/d/1qGDNaaXIq0kEOxhhezXKxAFHd4pWqapF_tenbaiGYRI/copy`) with pre-configured headers, validation, and script.
- **Salary Tracking (Column E)**: Added salary input field across `popup.html`, `popup.js`, and `GoogleAppsScript.js`.
- **JSON-LD Schema.org Scraper**: Robust extraction from `script[type="application/ld+json"]` (`JobPosting`), providing resilience against DOM class updates on LinkedIn, Indeed, Glassdoor, etc.
- **Draft Auto-Saving**: Automatically saves in-progress form inputs to `chrome.storage.local` to prevent data loss on popup dismissal.
- **Duplicate Application Alert**: Detects and warns if the active job URL was already tracked in history cache.
- **UX View Switcher**: Modern `#mainView` and `#settingsView` panel toggle replacing accordion layout shift.
- **Keyboard Shortcuts**: Added `Alt+Shift+J` to open popup and `Ctrl+Enter` / `Cmd+Enter` to submit.
- **Sheet Auto-Detection**: Apps Script targets sheet named `"Job Tracker"`, `"Applications"`, or Tab 0, and auto-initializes dropdowns on fresh sheets.

### Changed
- Updated `manifest.json` to version `1.1.0` with `host_permissions` for Google Apps Script domains.
- Updated UI styling with visual extraction badges, status banners, and shortcut hints.

---

## [1.0.1] - 2026-11-19

### Security
- **Credential Removal**: Stripped hardcoded personal spreadsheet IDs and live Webhook deployment URLs from `GoogleAppsScript.js` and `popup.js`.
- **Formula Injection Defense**: Implemented `sanitizeCell()` in `GoogleAppsScript.js` to escape leading `=`, `+`, `-`, `@` characters.
- **Hyperlink Sanitization**: Enforced protocol checks (`http://`, `https://`) and double-quote escaping for `=HYPERLINK` formulas.
- **Webhook URL Validation**: Added client-side regex check for `https://script.google.com/macros/s/` before sending payloads.

### Added
- Comprehensive step-by-step setup guide and column schema table in `README.md`.

---

## [1.0.0] - 2026-11-19

### Added
- Initial release of Job Application Sheet Tracker Chrome Extension (Manifest V3).
- 1-click job detail extraction for LinkedIn, Indeed, Greenhouse, Lever, Workday, Glassdoor, Wellfound, ZipRecruiter, and Ashby.
- Serverless Google Apps Script webhook backend (`GoogleAppsScript.js`).
- Dynamic user configuration storage via `chrome.storage.sync`.
- Store screenshots and visual documentation assets.
