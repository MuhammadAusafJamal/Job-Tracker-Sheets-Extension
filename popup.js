document.addEventListener('DOMContentLoaded', async () => {
  // Views & Banners
  const mainView = document.getElementById('mainView');
  const settingsView = document.getElementById('settingsView');
  const extractionBadge = document.getElementById('extractionBadge');
  const extractionBadgeText = document.getElementById('extractionBadgeText');
  const duplicateAlert = document.getElementById('duplicateAlert');
  const duplicateAlertText = document.getElementById('duplicateAlertText');
  const statusMessage = document.getElementById('statusMessage');
  const settingsStatusMessage = document.getElementById('settingsStatusMessage');

  // Form Inputs
  const jobForm = document.getElementById('jobForm');
  const companyInput = document.getElementById('company');
  const titleInput = document.getElementById('title');
  const jobTypeInput = document.getElementById('jobType');
  const locationInput = document.getElementById('location');
  const salaryInput = document.getElementById('salary');
  const statusInput = document.getElementById('status');
  const followUpInput = document.getElementById('followUp');
  const platformInput = document.getElementById('platform');
  const resumeVersionInput = document.getElementById('resumeVersion');
  const notesInput = document.getElementById('notes');
  const urlInput = document.getElementById('url');

  // Buttons
  const settingsBtn = document.getElementById('settingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const openSheetBtn = document.getElementById('openSheetBtn');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner');

  // Settings Inputs
  const sheetUrlInput = document.getElementById('sheetUrl');
  const webhookUrlInput = document.getElementById('webhookUrl');

  let activeTabUrl = "";

  // 1. Navigation Switcher
  function switchView(viewName) {
    if (viewName === 'settings') {
      mainView.classList.add('hidden');
      settingsView.classList.remove('hidden');
    } else {
      settingsView.classList.add('hidden');
      mainView.classList.remove('hidden');
    }
  }

  settingsBtn.addEventListener('click', () => {
    if (settingsView.classList.contains('hidden')) {
      switchView('settings');
    } else {
      switchView('main');
    }
  });

  closeSettingsBtn.addEventListener('click', () => {
    switchView('main');
  });

  // 2. Load Saved Settings
  chrome.storage.sync.get(['jobTrackerWebhookUrl', 'jobTrackerSheetUrl', 'resumeVersion'], (res) => {
    if (res.jobTrackerSheetUrl) {
      sheetUrlInput.value = res.jobTrackerSheetUrl;
      openSheetBtn.href = res.jobTrackerSheetUrl;
    }

    if (res.jobTrackerWebhookUrl) {
      webhookUrlInput.value = res.jobTrackerWebhookUrl;
    } else {
      // Prompt user to configure their webhook on first run
      switchView('settings');
      showSettingsMessage('Welcome! Please configure your Webhook URL to get started.', 'info');
    }

    if (res.resumeVersion) {
      resumeVersionInput.value = res.resumeVersion;
    }
  });

  // Open Sheet button click
  openSheetBtn.addEventListener('click', (e) => {
    const url = sheetUrlInput.value.trim();
    if (!url || !url.startsWith('http')) {
      e.preventDefault();
      switchView('settings');
      showSettingsMessage('Please paste your Google Sheet URL here first.', 'error');
    }
  });

  // Save Settings
  saveSettingsBtn.addEventListener('click', () => {
    const sheetUrl = sheetUrlInput.value.trim();
    const webhookUrl = webhookUrlInput.value.trim();

    if (!webhookUrl) {
      showSettingsMessage('Webhook URL is required.', 'error');
      return;
    }

    if (!webhookUrl.startsWith('https://script.google.com/macros/s/')) {
      showSettingsMessage('URL must start with: https://script.google.com/macros/s/', 'error');
      return;
    }

    chrome.storage.sync.set({
      jobTrackerSheetUrl: sheetUrl,
      jobTrackerWebhookUrl: webhookUrl
    }, () => {
      if (sheetUrl) {
        openSheetBtn.href = sheetUrl;
      }
      showSettingsMessage('Settings saved successfully!', 'success');
      setTimeout(() => {
        switchView('main');
        settingsStatusMessage.classList.add('hidden');
      }, 1000);
    });
  });

  // 3. Draft Auto-Saving (Anti-Data Loss)
  function saveDraft() {
    const draft = {
      company: companyInput.value,
      title: titleInput.value,
      jobType: jobTypeInput.value,
      location: locationInput.value,
      salary: salaryInput.value,
      status: statusInput.value,
      followUp: followUpInput.value,
      platform: platformInput.value,
      resumeVersion: resumeVersionInput.value,
      notes: notesInput.value,
      url: urlInput.value,
      savedAt: Date.now()
    };
    chrome.storage.local.set({ jobTrackerDraft: draft });
  }

  function clearDraft() {
    chrome.storage.local.remove(['jobTrackerDraft']);
  }

  jobForm.addEventListener('input', saveDraft);
  jobForm.addEventListener('change', saveDraft);

  // 4. Extraction & Duplicate Detection from Active Tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://')) {
      activeTabUrl = tab.url;
      urlInput.value = tab.url;

      // Check duplicates against history
      checkDuplicateJob(tab.url);

      // Execute precision scraper
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['extractor.js']
      });

      if (results && results[0] && results[0].result) {
        const extracted = results[0].result;
        if (extracted.company) companyInput.value = extracted.company;
        if (extracted.title) titleInput.value = extracted.title;
        if (extracted.location) locationInput.value = extracted.location;
        if (extracted.salary) salaryInput.value = extracted.salary;
        if (extracted.platform) platformInput.value = extracted.platform;
        if (extracted.url) urlInput.value = extracted.url;

        // Display extraction indicator badge
        extractionBadgeText.textContent = `⚡ Auto-detected from ${extracted.platform}`;
        extractionBadge.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.warn('Auto-extraction skipped:', err);
  }

  // Restore draft if active tab has no auto-extracted content or user had an ongoing draft
  chrome.storage.local.get(['jobTrackerDraft'], (res) => {
    const draft = res.jobTrackerDraft;
    // Restore if recent draft exists and form is mostly empty
    if (draft && (!companyInput.value || !titleInput.value) && (Date.now() - draft.savedAt < 3600000)) {
      if (draft.company) companyInput.value = draft.company;
      if (draft.title) titleInput.value = draft.title;
      if (draft.jobType) jobTypeInput.value = draft.jobType;
      if (draft.location) locationInput.value = draft.location;
      if (draft.salary) salaryInput.value = draft.salary;
      if (draft.status) statusInput.value = draft.status;
      if (draft.followUp) followUpInput.value = draft.followUp;
      if (draft.platform) platformInput.value = draft.platform;
      if (draft.resumeVersion) resumeVersionInput.value = draft.resumeVersion;
      if (draft.notes) notesInput.value = draft.notes;
      if (draft.url && !urlInput.value) urlInput.value = draft.url;
    }
  });

  // Duplicate Check Helper
  function checkDuplicateJob(pageUrl) {
    chrome.storage.local.get(['savedJobsHistory'], (res) => {
      const history = res.savedJobsHistory || [];
      const match = history.find(item => item.url && pageUrl && item.url.split('?')[0] === pageUrl.split('?')[0]);
      if (match) {
        duplicateAlertText.textContent = `Already tracked on ${match.date} (${match.status})`;
        duplicateAlert.classList.remove('hidden');
      }
    });
  }

  // 5. Keyboard Shortcut Support (Ctrl+Enter / Cmd+Enter to Submit)
  jobForm.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      jobForm.requestSubmit();
    }
  });

  // 6. Form Submission Handling
  jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const webhookUrl = webhookUrlInput.value.trim();
    const sheetUrl = sheetUrlInput.value.trim();

    if (!webhookUrl) {
      switchView('settings');
      showSettingsMessage('Please configure your Webhook URL first.', 'error');
      return;
    }

    if (!webhookUrl.startsWith('https://script.google.com/macros/s/')) {
      switchView('settings');
      showSettingsMessage('Invalid Webhook URL format.', 'error');
      return;
    }

    // Extract Spreadsheet ID from Google Sheet URL
    let spreadsheetId = "";
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      spreadsheetId = match[1];
    }

    // Persist resume version preference
    chrome.storage.sync.set({ resumeVersion: resumeVersionInput.value.trim() });

    const payload = {
      spreadsheetId: spreadsheetId,
      sheetUrl: sheetUrl,
      company: companyInput.value.trim(),
      title: titleInput.value.trim(),
      jobType: jobTypeInput.value,
      location: locationInput.value.trim(),
      salary: salaryInput.value.trim(),
      status: statusInput.value,
      followUp: followUpInput.value,
      platform: platformInput.value.trim() || "Website",
      resumeVersion: resumeVersionInput.value.trim() || "V2",
      url: urlInput.value.trim(),
      notes: notesInput.value.trim()
    };

    setLoading(true);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(payload)
      });

      let jsonResult = null;
      try {
        jsonResult = await response.json();
      } catch (parseErr) {
        // Fallback for redirected text response
      }

      if (jsonResult && jsonResult.result === "error") {
        throw new Error(jsonResult.error || "Webhook failed to append row.");
      }

      // Add to local history cache
      addToHistory({
        url: payload.url,
        company: payload.company,
        title: payload.title,
        status: payload.status,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });

      // Clear draft on success
      clearDraft();

      showMessage('✓ Successfully added to Google Sheet!', 'success');
      setTimeout(() => {
        window.close();
      }, 1200);

    } catch (err) {
      console.error('Submission error:', err);
      showMessage('Error: ' + (err.message || 'Failed to connect to Apps Script webhook'), 'error');
    } finally {
      setLoading(false);
    }
  });

  // History Helper (stores up to 50 recent entries)
  function addToHistory(jobEntry) {
    chrome.storage.local.get(['savedJobsHistory'], (res) => {
      let history = res.savedJobsHistory || [];
      history.unshift(jobEntry);
      if (history.length > 50) history = history.slice(0, 50);
      chrome.storage.local.set({ savedJobsHistory: history });
    });
  }

  function showMessage(text, type) {
    statusMessage.textContent = text;
    statusMessage.className = `status-msg ${type}`;
    statusMessage.classList.remove('hidden');
  }

  function showSettingsMessage(text, type) {
    settingsStatusMessage.textContent = text;
    settingsStatusMessage.className = `status-msg ${type}`;
    settingsStatusMessage.classList.remove('hidden');
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
