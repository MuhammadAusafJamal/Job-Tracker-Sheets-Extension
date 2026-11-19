# Job-Tracker-Sheets-Extension

> 1-click save any job application details from LinkedIn, Indeed, Greenhouse, Lever, Workday, Glassdoor, and more directly into your Google Sheet.

A Manifest V3 Chrome Extension that streamlines your job search by automatically extracting job listing details and logging them straight into a Google Sheets tracker via a Google Apps Script webhook.

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
  - Generic / direct company career pages
- **Direct Google Sheets Sync**: Uses a serverless Google Apps Script webhook (`GoogleAppsScript.js`) to append entries without requiring complex OAuth setups.
- **Customizable Fields**: Edit or add details on the fly (Job Type, Application Status, Follow-Up Date, Resume Version, and Notes).
- **Custom Spreadsheet Support**: Connect your own Google Sheet URL and Apps Script Webhook directly from the extension settings.

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
├── icon.png                 # Extension icons
└── store_screenshots/       # Visual guides and store screenshots
```

---

## 🛠️ Installation & Setup

### 1. Load Extension in Chrome
1. Clone or download this repository:
   ```bash
   git clone https://github.com/MuhammadAusafJamal/Job-Tracker-Sheets-Extension.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the `Job-Tracker-Sheets-Extension` directory.

### 2. Google Apps Script Setup
1. Create a new [Google Sheet](https://sheets.new) for tracking your applications.
2. In Google Sheets, navigate to **Extensions > Apps Script**.
3. Replace the code in the script editor with the contents of [`GoogleAppsScript.js`](./GoogleAppsScript.js).
4. Update `DEFAULT_SPREADSHEET_ID` with your Google Sheet ID (from the sheet URL).
5. Click **Deploy > New deployment**.
6. Select **Web app**:
   - **Execute as**: Me (`your-email@gmail.com`)
   - **Who has access**: Anyone
7. Copy the generated Web App URL.
8. Open the Chrome Extension popup, click **Settings (⚙️)**, paste your Webhook URL and Sheet URL, then click **Save Configuration**.

---

## 📄 License

MIT License. Feel free to use, modify, and distribute.
