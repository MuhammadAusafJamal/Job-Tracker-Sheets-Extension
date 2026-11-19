// Smart Job Details Extractor for Chrome Extension
(function() {
  const url = window.location.href;
  const hostname = window.location.hostname.toLowerCase();

  let data = {
    title: "",
    company: "",
    location: "Remote",
    platform: "Website",
    url: url
  };

  // 1. Detect Platform
  if (hostname.includes("linkedin.com")) data.platform = "LinkedIn";
  else if (hostname.includes("indeed.com")) data.platform = "Indeed";
  else if (hostname.includes("greenhouse.io")) data.platform = "Greenhouse";
  else if (hostname.includes("lever.co")) data.platform = "Lever";
  else if (hostname.includes("myworkdayjobs.com") || hostname.includes("workday.com")) data.platform = "Workday";
  else if (hostname.includes("glassdoor.com")) data.platform = "Glassdoor";
  else if (hostname.includes("wellfound.com") || hostname.includes("angel.co")) data.platform = "Wellfound";
  else if (hostname.includes("ziprecruiter.com")) data.platform = "ZipRecruiter";
  else if (hostname.includes("ashbyhq.com")) data.platform = "Ashby";
  else {
    const cleanHost = hostname.replace(/^www\./, '').split('.')[0];
    data.platform = cleanHost.charAt(0).toUpperCase() + cleanHost.slice(1);
  }

  // 2. Platform Specific Precision Scrapers
  if (data.platform === "Indeed") {
    const titleEl = document.querySelector(
      "h1.jobsearch-JobInfoHeader-title, " +
      "[data-testid='jobsearch-JobInfoHeader-title'], " +
      ".jobsearch-JobInfoHeader-title, " +
      "h1[class*='jobTitle'], " +
      "h2.jobTitle"
    );
    const compEl = document.querySelector(
      "[data-testid='inlineHeader-companyName'] a, " +
      "[data-testid='inlineHeader-companyName'], " +
      "[data-testid='company-name'], " +
      ".jobsearch-InlineCompanyRating-companyHeader a, " +
      ".jobsearch-InlineCompanyRating-companyHeader, " +
      "[data-company-name='true']"
    );
    const locEl = document.querySelector(
      "[data-testid='inlineHeader-companyLocation'], " +
      "[data-testid='job-location'], " +
      ".jobsearch-JobInfoHeader-companyLocation"
    );

    if (titleEl) data.title = titleEl.innerText.replace(/[\n\r]+/g, ' ').trim();
    if (compEl) data.company = compEl.innerText.replace(/[\n\r]+/g, ' ').trim();
    if (locEl) data.location = locEl.innerText.replace(/[\n\r]+/g, ' ').trim();
  }
  else if (data.platform === "LinkedIn") {
    const titleEl = document.querySelector(
      ".job-details-jobs-unified-top-card__job-title, " +
      ".jobs-unified-top-card__job-title, " +
      "h1.top-card-layout__title, " +
      ".topcard__title, " +
      ".job-details-jobs-unified-top-card__job-title-link"
    );
    const compEl = document.querySelector(
      ".job-details-jobs-unified-top-card__company-name a, " +
      ".job-details-jobs-unified-top-card__company-name, " +
      ".jobs-unified-top-card__company-name, " +
      ".topcard__org-name-link, " +
      ".top-card-layout__first-subline a"
    );
    const locEl = document.querySelector(
      ".job-details-jobs-unified-top-card__bullet, " +
      ".jobs-unified-top-card__bullet, " +
      ".topcard__flavor--bullet, " +
      ".top-card-layout__first-subline .topcard__flavor"
    );

    if (titleEl) data.title = titleEl.innerText.trim();
    if (compEl) data.company = compEl.innerText.trim();
    if (locEl) data.location = locEl.innerText.trim();
  }
  else if (data.platform === "Ashby") {
    const titleEl = document.querySelector("h1, h2");
    const compEl = document.querySelector("._companyName_1h6j2_54, a[href*='/'] img, nav a");
    const locEl = document.querySelector("._metadata_1h6j2_67, ._secondary_1h6j2_76");

    if (titleEl) data.title = titleEl.innerText.trim();
    if (compEl) data.company = compEl.innerText || compEl.alt || "";
    if (locEl) data.location = locEl.innerText.trim();
  }
  else if (data.platform === "Greenhouse") {
    const titleEl = document.querySelector(".app-title, h1.app-title, h1.job-title");
    const compEl = document.querySelector(".company-name, .logo-container img");
    const locEl = document.querySelector(".location, .body--metadata");

    if (titleEl) data.title = titleEl.innerText.trim();
    if (compEl) data.company = compEl.alt || compEl.innerText.trim();
    if (locEl) data.location = locEl.innerText.trim();
  }
  else if (data.platform === "Lever") {
    const titleEl = document.querySelector(".posting-headline h2");
    const compEl = document.querySelector(".main-header-logo img, .posting-headline");
    const locEl = document.querySelector(".posting-categories .location, .posting-category.location");

    if (titleEl) data.title = titleEl.innerText.trim();
    if (compEl) data.company = compEl.alt || "";
    if (locEl) data.location = locEl.innerText.trim();
  }

  // 3. Fallbacks: If title or company empty, parse page <title> safely
  // Format is usually: "Job Title - Company Name | Platform"
  if (!data.title || !data.company) {
    const pageTitle = document.title || "";
    const cleanTitle = pageTitle.replace(/\|.*$/, '').replace(/ - Indeed.*$/i, '').trim();
    const parts = cleanTitle.split(/[-–—]/);

    if (parts.length >= 2) {
      if (!data.title) data.title = parts[0].trim();
      if (!data.company) data.company = parts[1].trim();
    } else {
      if (!data.title) data.title = cleanTitle;
      if (!data.company) data.company = data.platform;
    }
  }

  // Prevent platform name from ever overwriting company name
  if (data.company.toLowerCase() === "indeed" || data.company.toLowerCase() === "linkedin") {
    const parts = document.title.split(/[-–—|]/);
    if (parts.length > 1) {
      data.company = parts[1].trim();
    }
  }

  return data;
})();
