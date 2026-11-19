document.addEventListener('DOMContentLoaded', async () => {
  const companyInput = document.getElementById('company');
  const titleInput = document.getElementById('title');
  const jobTypeInput = document.getElementById('jobType');
  const locationInput = document.getElementById('location');
  const statusInput = document.getElementById('status');
  const followUpInput = document.getElementById('followUp');
  const platformInput = document.getElementById('platform');
  const resumeVersionInput = document.getElementById('resumeVersion');
  const urlInput = document.getElementById('url');
  const notesInput = document.getElementById('notes');

  const settingsBtn = document.getElementById('settingsBtn');
  const settingsBox = document.getElementById('settingsBox');
  const sheetUrlInput = document.getElementById('sheetUrl');
  const webhookUrlInput = document.getElementById('webhookUrl');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const openSheetBtn = document.getElementById('openSheetBtn');

  const jobForm = document.getElementById('jobForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner');
  const statusMessage = document.getElementById('statusMessage');

  // Default Sheet URL
  const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1qGDNaaXIq0kEOxhhezXKxAFHd4pWqapF_tenbaiGYRI/edit#gid=651196576";
  const DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz4SyeSh9ZnQ1LePDkqtcNFyMnOhBO7e1DMSwWk4DHdBE79BpRO4mp5NkvgA2slUgMN/exec";

  // 1. Load saved settings
  chrome.storage.sync.get(['jobTrackerWebhookUrl', 'jobTrackerSheetUrl', 'resumeVersion'], (res) => {
    const currentSheetUrl = res.jobTrackerSheetUrl || DEFAULT_SHEET_URL;
    sheetUrlInput.value = currentSheetUrl;
    openSheetBtn.href = currentSheetUrl;

    if (res.jobTrackerWebhookUrl) {
      webhookUrlInput.value = res.jobTrackerWebhookUrl;
    } else {
      webhookUrlInput.value = DEFAULT_WEBHOOK_URL;
      chrome.storage.sync.set({ jobTrackerWebhookUrl: DEFAULT_WEBHOOK_URL });
    }

    if (res.resumeVersion) {
      resumeVersionInput.value = res.resumeVersion;
    }
  });

  // Toggle settings
  settingsBtn.addEventListener('click', () => {
    settingsBox.classList.toggle('hidden');
  });

  // Save Settings
  saveSettingsBtn.addEventListener('click', () => {
    const sheetUrl = sheetUrlInput.value.trim();
    const webhookUrl = webhookUrlInput.value.trim();

    if (!webhookUrl) {
      showMessage('Webhook URL is required.', 'error');
      return;
    }

    chrome.storage.sync.set({
      jobTrackerSheetUrl: sheetUrl,
      jobTrackerWebhookUrl: webhookUrl
    }, () => {
      openSheetBtn.href = sheetUrl || '#';
      showMessage('Settings saved!', 'success');
      setTimeout(() => {
        settingsBox.classList.add('hidden');
        statusMessage.classList.add('hidden');
      }, 1000);
    });
  });

  // 2. Extract Data from active tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://')) {
      urlInput.value = tab.url;

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['extractor.js']
      });

      if (results && results[0] && results[0].result) {
        const extracted = results[0].result;
        if (extracted.company) companyInput.value = extracted.company;
        if (extracted.title) titleInput.value = extracted.title;
        if (extracted.location) locationInput.value = extracted.location;
        if (extracted.platform) platformInput.value = extracted.platform;
        if (extracted.url) urlInput.value = extracted.url;
      }
    }
  } catch (err) {
    console.warn('Auto-extraction skipped:', err);
  }

  // 3. Handle Form Submit
  jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const webhookUrl = webhookUrlInput.value.trim() || DEFAULT_WEBHOOK_URL;
    const sheetUrl = sheetUrlInput.value.trim() || DEFAULT_SHEET_URL;

    // Extract Spreadsheet ID from Google Sheet URL
    let spreadsheetId = "";
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      spreadsheetId = match[1];
    }

    // Save resume version
    chrome.storage.sync.set({ resumeVersion: resumeVersionInput.value.trim() });

    const payload = {
      spreadsheetId: spreadsheetId,
      sheetUrl: sheetUrl,
      company: companyInput.value.trim(),
      title: titleInput.value.trim(),
      jobType: jobTypeInput.value,
      location: locationInput.value.trim(),
      status: statusInput.value,
      followUp: followUpInput.value,
      platform: platformInput.value.trim() || "Website",
      resumeVersion: resumeVersionInput.value.trim() || "V2",
      url: urlInput.value.trim(),
      notes: notesInput.value.trim()
    };

    setLoading(true);

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(payload)
      });

      showMessage('✓ Successfully added to Google Sheet!', 'success');
      setTimeout(() => {
        window.close();
      }, 1200);

    } catch (err) {
      console.error(err);
      showMessage('Failed to send data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  });

  function showMessage(text, type) {
    statusMessage.textContent = text;
    statusMessage.className = `status-msg ${type}`;
    statusMessage.classList.remove('hidden');
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.textContent = 'Saving...';
      spinner.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      btnText.textContent = 'Add to Google Sheet';
      spinner.classList.add('hidden');
    }
  }
});
