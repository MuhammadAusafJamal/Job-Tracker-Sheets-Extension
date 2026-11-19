# Job-Tracker-Sheets-Extension

> 1-click save any job application details from LinkedIn, Indeed, Greenhouse, Lever, Workday, Glassdoor, and more directly into your Google Sheet.

A Manifest V3 Chrome Extension that streamlines your job search by automatically extracting job listing details and logging them straight into your personal Google Sheets tracker via a serverless Google Apps Script webhook.

---

## 🚀 Features

- **Smart Auto-Detection**: Uses schema.org `JobPosting` JSON-LD data and platform-specific DOM extractors to auto-populate:
  - Job Title
  - Company Name
  - Location (City, State, or "Remote")
  - Salary Range
  - Application URL
  - Platform Source
- **Supported Job Boards**:
  - LinkedIn
  - Indeed
  - Greenhouse
  - Lever
  - Workday
  - Glassdoor
  - Wellfound (AngelList)
  - ZipRecruiter
  - Ashby
  - Direct company career pages
- **Direct Google Sheets Sync**: Appends rows directly into your private Google Sheet without OAuth verification hurdles.
- **Duplicate Job Warning**: Alerts you if you already tracked a job application from that same posting.
- **Draft Auto-Save**: Prevents data loss if you accidentally click away from the popup.
- **Keyboard Shortcuts**: Open popup with `Alt+Shift+J` and submit with `Ctrl+Enter` / `Cmd+Enter`.
- **Zero Hardcoded Secrets**: Your Webhook URL and Sheet URL stay private in your local browser sync storage.
- **Spreadsheet Formula Injection Defense**: Escapes leading `=`, `+`, `-`, `@` characters to protect your Google Sheet from formula injection attacks.

---

## 📁 Project Structure

```text
Job-Tracker-Sheets-Extension/
├── manifest.json            # Chrome extension Manifest V3 definition
├── popup.html               # Extension popup UI (Main view & Settings switcher)
├── popup.css                # Styling for the extension popup
├── popup.js                 # Controller, extraction, draft persistence, & webhook sync
├── extractor.js             # JSON-LD + DOM content scraper
├── GoogleAppsScript.js      # Backend webhook script for Google Sheets
├── icon.png                 # Extension icon
└── store_screenshots/       # Visual guides and preview screenshots
```

---

## 📋 Google Sheet Column Schema

Your Google Sheet uses the following columns from Row 1:

| Column | Header | Type / Format | Example |
|---|---|---|---|
| **A** | **Company** | Text | Acme Corp |
| **B** | **Job Title** | Text | Senior Software Engineer |
| **C** | **Job Type** | Text / Dropdown | Full-time |
| **D** | **Location** | Text | Remote / New York, NY |
| **E** | **Salary** | Text | $120,000 - $140,000 |
| **F** | **Status** | Dropdown | 🟩 Applied, Interviewing, Offer, Rejected |
| **G** | **Follow-up** | Dropdown | ⏳ Not set, Pending, Followed up |
| **H** | **Link** | Hyperlink Formula | `=HYPERLINK("https://...", "LinkedIn Job Posting")` |
| **I** | **Resume Version** | Text | V2, Frontend_2026 |
| **J** | **Date** | Date Text | Aug 15, 2026 |
| **K** | **Notes** | Text | Referred by John Doe |

> **Tip**: Row 2's formatting, font colors, borders, and dropdown validations are automatically inherited by every newly added row.

---

## 🛠️ Step-by-Step Setup Helper

### Step 1: Get Your Google Sheet (1-Click Template)
You have two choices:
* **Option A (Fastest - 1 Click)**: Open the [Job Tracker Sheet Template](https://docs.google.com/spreadsheets/d/1qGDNaaXIq0kEOxhhezXKxAFHd4pWqapF_tenbaiGYRI/copy) and click **"Make a copy"**. All columns, dropdowns, and formatting are pre-configured.
* **Option B (Custom Sheet)**: Create a new sheet at [sheets.new](https://sheets.new) and add the headers from the [Column Schema](#-google-sheet-column-schema) table above.

### Step 2: Deploy Google Apps Script Webhook
1. In your copied Google Sheet, click **Extensions > Apps Script** in the top menu.
2. If code already exists, ensure it matches [`GoogleAppsScript.js`](./GoogleAppsScript.js). If blank, copy and paste the entire content of [`GoogleAppsScript.js`](./GoogleAppsScript.js) into `Code.gs`.
3. In the top right, click **Deploy > New deployment**.
4. Click the gear icon (**Select type**) and select **Web app**.
5. Configure deployment:
   - **Description**: `Job Tracker Webhook`
   - **Execute as**: `Me (<your-email>@gmail.com)`
   - **Who has access**: `Anyone` *(required for the extension to send payloads without OAuth flow)*
6. Click **Deploy**.
7. Grant Google permissions when prompted:
   - Click *Review permissions* -> Choose your Google account -> Click *Advanced* -> Click *Go to Job Tracker (unsafe)* -> Click *Allow*.
8. **Copy the Web App URL** (`https://script.google.com/macros/s/.../exec`).

### Step 3: Install the Extension in Chrome
1. Clone this repository or download it as a ZIP:
   ```bash
   git clone https://github.com/MuhammadAusafJamal/Job-Tracker-Sheets-Extension.git
   ```
2. Open Google Chrome and go to `chrome://extensions/`.
3. Toggle on **Developer mode** in the top-right corner.
4. Click **Load unpacked** (top-left).
5. Select the `Job-Tracker-Sheets-Extension` directory.

### Step 4: Configure the Extension
1. Click the **Job Tracker** icon in your Chrome toolbar (or press `Alt+Shift+J`).
2. Click the **Settings icon (⚙️)** in the top right.
3. Paste:
   - **Google Sheet URL**: Your Google Sheet URL.
   - **Apps Script Web App URL**: Your deployed Web App URL.
4. Click **Save Settings**.

---

## ⌨️ Shortcuts

- `Alt+Shift+J`: Open the extension popup from any tab.
- `Ctrl+Enter` / `Cmd+Enter`: Save the application to Google Sheet.

---

## 🔒 Security Best Practices

- **Private Webhook URL**: Treat your Google Apps Script Web App URL like a private token. Never commit it into public repositories.
- **Formula Injection Sanitization**: All fields are sanitized in `GoogleAppsScript.js` to escape spreadsheet formula injection (values prefixed with `=`, `+`, `-`, or `@`).
- **Origin Validation**: The extension validates that Webhook URLs originate from `https://script.google.com/macros/s/`.
- **Isolated Storage**: Settings and drafts are saved in Chrome storage local/sync bound strictly to your authenticated browser profile.

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| **"Please configure your Webhook URL in Settings"** | Webhook URL has not been saved yet | Click ⚙️ and paste your Web App URL. |
| **"Could not find or open target spreadsheet"** | Invalid Sheet ID or permissions | Ensure the Google Apps Script deployment is running as **Me** and has access to your sheet. |
| **"Script function not found: doGet/doPost"** | Code was not saved before deploying | In Apps Script, press Ctrl+S, then make a **New version** under Deploy > Manage deployments. |
| **Auto-extraction didn't grab company/title** | Obfuscated page markup | Enter company/title manually in the popup — it will still sync directly to your sheet. |

---

## 📄 License

MIT License. Free to use, modify, and distribute.
