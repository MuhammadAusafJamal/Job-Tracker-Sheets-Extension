# Job-Tracker-Sheets-Extension

> 1-click save any job application details from LinkedIn, Indeed, Greenhouse, Lever, Workday, Glassdoor, and more directly into your Google Sheet.

A Manifest V3 Chrome Extension that streamlines your job search by automatically extracting job listing details and logging them straight into your personal Google Sheets tracker via a secure Google Apps Script webhook.

---

## 🚀 Features

- **Smart Auto-Detection**: Automatically extracts Job Title, Company Name, Location, and Application URL from popular job platforms:
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
- **Direct Google Sheets Sync**: Uses a serverless Google Apps Script webhook (`GoogleAppsScript.js`) to append rows instantly.
- **Customizable Fields**: Edit or add details on the fly (Job Type, Application Status, Follow-Up Date, Resume Version, and Notes).
- **Zero Hardcoded Secrets**: Completely private — your Webhook URL and Google Sheet ID stay in your local browser sync storage.
- **Spreadsheet Formula Injection Protection**: Sanitizes inputs to prevent formula injection attacks (`=`, `+`, `-`, `@`) from untrusted job descriptions.

---

## 📁 Project Structure

```text
Job-Tracker-Sheets-Extension/
├── manifest.json            # Chrome extension Manifest V3 definition
├── popup.html               # Extension popup UI
├── popup.css                # Styling for the extension popup
├── popup.js                 # Popup controller & form handling logic
├── extractor.js             # Content script for automated page scraping
├── GoogleAppsScript.js      # Backend webhook script for Google Sheets
├── icon.png                 # Extension icon
└── store_screenshots/       # Visual guides and preview screenshots
```

---

## 📋 Google Sheet Column Schema

Your Google Sheet must have the following column headers in Row 1:

| Column | Header | Type / Format | Example |
|---|---|---|---|
| **A** | **Company** | Text | Acme Corp |
| **B** | **Job Title** | Text | Senior Software Engineer |
| **C** | **Job Type** | Text / Dropdown | Full-time |
| **D** | **Location** | Text | Remote / New York, NY |
| **E** | **Salary** | Text | $120,000 - $140,000 |
| **F** | **Status** | Dropdown | 🟩 Applied, Interviewing, Offer, Rejected |
| **G** | **Follow-up** | Dropdown | ⏳ Not set, Pending, Followed up |
| **H** | **Link** | Hyperlink | `=HYPERLINK("https://...", "LinkedIn Job Posting")` |
| **I** | **Resume Version** | Text | V2, Frontend_2026 |
| **J** | **Date** | Date Text | Aug 15, 2026 |
| **K** | **Notes** | Text | Referred by John Doe |

> **Tip**: Row 2's formatting, font colors, borders, and dropdown validations are automatically copied to each new row appended by the webhook.

---

## 🛠️ Step-by-Step Setup Helper

### Step 1: Create Your Google Sheet
1. Create a new sheet at [sheets.new](https://sheets.new).
2. Set up row 1 with the headers listed in the [Column Schema](#-google-sheet-column-schema) table above.
3. (Optional) Set up dropdown validation or formatting in row 2.
4. Copy your Sheet URL from the browser address bar (e.g. `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`).

### Step 2: Deploy Google Apps Script Webhook
1. In your Google Sheet, click **Extensions > Apps Script** in the top menu.
2. Delete any existing code in the editor (`Code.gs`).
3. Copy and paste the entire content of [`GoogleAppsScript.js`](./GoogleAppsScript.js) into the editor.
4. *(Optional)* Set `DEFAULT_SPREADSHEET_ID` in line 7 to your sheet ID (the string between `/d/` and `/edit` in your sheet URL). If left blank, it automatically defaults to the active bound sheet.
5. In the top right, click **Deploy > New deployment**.
6. Click the gear icon (**Select type**) and choose **Web app**.
7. Configure the deployment settings:
   - **Description**: `Job Tracker Webhook`
   - **Execute as**: `Me (<your-email>@gmail.com)`
   - **Who has access**: `Anyone` *(required for the Chrome extension to send payloads without OAuth flow)*
8. Click **Deploy**.
9. Grant the necessary permissions when prompted by Google:
   - Click *Review permissions* -> Choose your Google account -> Click *Advanced* -> Click *Go to (Untitled project) (unsafe)* -> Click *Allow*.
10. **Copy the Web App URL** (format: `https://script.google.com/macros/s/.../exec`).

### Step 3: Install the Extension in Chrome
1. Clone this repository or download it as a ZIP:
   ```bash
   git clone https://github.com/MuhammadAusafJamal/Job-Tracker-Sheets-Extension.git
   ```
2. Open Google Chrome and go to `chrome://extensions/`.
3. Toggle on **Developer mode** (top-right corner).
4. Click **Load unpacked** (top-left).
5. Select the `Job-Tracker-Sheets-Extension` folder.

### Step 4: Configure the Extension
1. Click the **Job Tracker** icon in your Chrome toolbar.
2. Click the **Settings icon (⚙️)** in the top right of the popup.
3. Paste:
   - **Google Sheet URL**: Your Google Sheet URL.
   - **Apps Script Web App URL**: Your deployed Web App URL (`https://script.google.com/macros/s/.../exec`).
4. Click **Save Settings**.

---

## 🔒 Security Best Practices

- **Private Webhook URL**: Treat your Google Apps Script Web App URL like an API token. Do not commit your personal Web App URL or private Sheet URL into public Git repositories.
- **Form Injection Sanitization**: All user inputs and extracted text are sanitized in `GoogleAppsScript.js` to prevent CSV / formula injection (values prefixed with `=`, `+`, `-`, or `@` are safely escaped).
- **Origin & Scheme Validation**: The extension verifies URLs are valid HTTPS endpoints before dispatching data.
- **Isolated Storage**: Configurations are stored in `chrome.storage.sync` bound strictly to your authenticated Chrome profile.

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| **"Please configure your Webhook URL in Settings"** | Webhook URL has not been saved yet | Click ⚙️ and paste your Web App URL. |
| **"Could not find or open target spreadsheet"** | Invalid Sheet ID or permissions | Ensure the Google Apps Script deployment is running as **Me** and has access to the sheet. |
| **"Script function not found: doGet/doPost"** | Code was not saved before deploying | In Apps Script, press Ctrl+S to save, then make a **New version** under Deploy > Manage deployments. |
| **Auto-extraction didn't grab company/title** | Custom/non-standard page markup | Enter the company/title manually in the popup form — it will still save directly to your sheet. |

---

## 📄 License

MIT License. Free to use, modify, and distribute.
