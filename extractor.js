// Smart Job Details Extractor for Chrome Extension
(function() {
  const url = window.location.href;
  const hostname = window.location.hostname.toLowerCase();

  let data = {
    title: "",
    company: "",
    location: "Remote",
    salary: "",
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

  // 2. Try JSON-LD Schema.org Scraper (High Accuracy across LinkedIn, Indeed, Glassdoor, etc.)
  try {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of jsonLdScripts) {
      if (!script.innerText) continue;
      try {
        let parsed = JSON.parse(script.innerText);
        let items = Array.isArray(parsed) ? parsed : (parsed["@graph"] || [parsed]);
        for (const item of items) {
          if (item && (item["@type"] === "JobPosting" || item["@type"] === "http://schema.org/JobPosting")) {
            if (item.title && !data.title) data.title = item.title.trim();
            if (item.hiringOrganization && item.hiringOrganization.name && !data.company) {
              data.company = item.hiringOrganization.name.trim();
            }
            if (item.jobLocationType === "TELECOMMUTE") {
              data.location = "Remote";
            } else if (item.jobLocation && item.jobLocation.address) {
              const addr = item.jobLocation.address;
              const locParts = [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean);
              if (locParts.length > 0) data.location = locParts.join(", ");
            }
            if (item.baseSalary) {
              const bs = item.baseSalary;
              const currency = bs.currency || "$";
              if (bs.value) {
                if (typeof bs.value === "object") {
                  const min = bs.value.minValue || "";
                  const max = bs.value.maxValue || "";
                  const unit = bs.value.unitText ? ` / ${bs.value.unitText.toLowerCase()}` : "";
                  if (min && max) data.salary = `${currency}${min} - ${currency}${max}${unit}`;
                  else if (min || max) data.salary = `${currency}${min || max}${unit}`;
                } else {
                  data.salary = `${currency}${bs.value}`;
                }
              }
            }
            break;
          }
        }
      } catch (e) {
        // Continue to next script tag
      }
    }
  } catch (err) {
    // Schema parsing failure fallback
  }

  // 3. Platform-Specific DOM Selectors (Override or fill gaps)
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
    const salaryEl = document.querySelector(
      "#salaryInfoAndJobType, " +
      "[data-testid='jobsearch-JobInfoHeader-salary'], " +
      ".jobsearch-JobInfoHeader-salary, " +
      ".jobsearch-JobMetadataHeader-item"
    );

    if (titleEl && !data.title) data.title = titleEl.innerText.replace(/[\n\r]+/g, ' ').trim();
    if (compEl && !data.company) data.company = compEl.innerText.replace(/[\n\r]+/g, ' ').trim();
    if (locEl && (!data.location || data.location === "Remote")) data.location = locEl.innerText.replace(/[\n\r]+/g, ' ').trim();
    if (salaryEl && !data.salary) data.salary = salaryEl.innerText.replace(/[\n\r]+/g, ' ').trim();
  }
  else if (data.platform === "LinkedIn") {
    const titleEl = document.querySelector(
      ".job-details-jobs-unified-top-card__job-title, " +
      ".jobs-unified-top-card__job-title, " +
      "h1.top-card-layout__title, " +
      ".topcard__title, " +
      ".job-details-jobs-unified-top-card__job-title-link, " +
      "h1.t-24"
    );
    const compEl = document.querySelector(
      ".job-details-jobs-unified-top-card__company-name a, " +
      ".job-details-jobs-unified-top-card__company-name, " +
      ".jobs-unified-top-card__company-name, " +
      ".topcard__org-name-link, " +
      ".top-card-layout__first-subline a, " +
      ".job-details-jobs-unified-top-card__primary-description-container a"
    );
    const locEl = document.querySelector(
      ".job-details-jobs-unified-top-card__bullet, " +
      ".jobs-unified-top-card__bullet, " +
      ".topcard__flavor--bullet, " +
      ".top-card-layout__first-subline .topcard__flavor, " +
      ".job-details-jobs-unified-top-card__primary-description-container span"
    );
    const salaryEl = document.querySelector(
      ".job-details-jobs-unified-top-card__job-insight, " +
      ".job-details-preferences-and-skills"
    );

    if (titleEl && !data.title) data.title = titleEl.innerText.trim();
    if (compEl && !data.company) data.company = compEl.innerText.trim();
    if (locEl && (!data.location || data.location === "Remote")) data.location = locEl.innerText.trim();
    if (salaryEl && !data.salary && salaryEl.innerText.includes("$")) {
      data.salary = salaryEl.innerText.split("\n")[0].trim();
    }
  }
  else if (data.platform === "Ashby") {
    const titleEl = document.querySelector("h1, h2");
    const compEl = document.querySelector("._companyName_1h6j2_54, a[href*='/'] img, nav a");
    const locEl = document.querySelector("._metadata_1h6j2_67, ._secondary_1h6j2_76");

    if (titleEl && !data.title) data.title = titleEl.innerText.trim();
    if (compEl && !data.company) data.company = compEl.innerText || compEl.alt || "";
    if (locEl && (!data.location || data.location === "Remote")) data.location = locEl.innerText.trim();
  }
  else if (data.platform === "Greenhouse") {
    const titleEl = document.querySelector(".app-title, h1.app-title, h1.job-title, .job__title");
    const compEl = document.querySelector(".company-name, .logo-container img, .job__company");
    const locEl = document.querySelector(".location, .body--metadata, .job__location");

    if (titleEl && !data.title) data.title = titleEl.innerText.trim();
    if (compEl && !data.company) data.company = compEl.alt || compEl.innerText.trim();
    if (locEl && (!data.location || data.location === "Remote")) data.location = locEl.innerText.trim();
  }
  else if (data.platform === "Lever") {
    const titleEl = document.querySelector(".posting-headline h2");
    const compEl = document.querySelector(".main-header-logo img, .posting-headline");
    const locEl = document.querySelector(".posting-categories .location, .posting-category.location");

    if (titleEl && !data.title) data.title = titleEl.innerText.trim();
    if (compEl && !data.company) data.company = compEl.alt || "";
    if (locEl && (!data.location || data.location === "Remote")) data.location = locEl.innerText.trim();
  }
  else if (data.platform === "Glassdoor") {
    const titleEl = document.querySelector("[data-test='job-title'], h1");
    const compEl = document.querySelector("[data-test='employer-name']");
    const locEl = document.querySelector("[data-test='location']");
    const salaryEl = document.querySelector("[data-test='detailSalary']");

    if (titleEl && !data.title) data.title = titleEl.innerText.trim();
    if (compEl && !data.company) data.company = compEl.innerText.replace(/\d+(\.\d+)?\s*★.*/, '').trim();
    if (locEl && (!data.location || data.location === "Remote")) data.location = locEl.innerText.trim();
    if (salaryEl && !data.salary) data.salary = salaryEl.innerText.trim();
  }

  // 4. Fallbacks: Page <title> and OpenGraph Meta Tags
  if (!data.title || !data.company) {
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content || "";
    const pageTitle = ogTitle || document.title || "";
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

  // Prevent platform name from overriding company name
  if (data.company.toLowerCase() === "indeed" || data.company.toLowerCase() === "linkedin") {
    const parts = document.title.split(/[-–—|]/);
    if (parts.length > 1) {
      data.company = parts[1].trim();
    }
  }

  return data;
})();
