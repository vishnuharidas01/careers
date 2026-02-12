#!/usr/bin/env node
/**
 * Create a new job page scaffold at src/jobs/<slug>.md
 * Usage:
 *   node scripts/new-job.js --company "MUFG Retirement Solutions" --role "Mobile Application Developer"
 * Or:
 *   node scripts/new-job.js --slug "mufg-mobile-dev" --company "MUFG" --role "Mobile Dev"
 */

const fs = require("fs");
const path = require("path");

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function slugify(str = "") {
  return String(str)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function must(v, name) {
  if (!v) {
    console.error(`Missing required ${name}.`);
    process.exit(1);
  }
  return v;
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

(async function main() {
  const company = getArg("--company");
  const role = getArg("--role");
  const slugArg = getArg("--slug");

  must(company, "--company");
  must(role, "--role");

  const slug = slugArg ? slugify(slugArg) : slugify(`${company} ${role}`);
  const outDir = path.join(process.cwd(), "src", "jobs");
  const outPath = path.join(outDir, `${slug}.md`);

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  if (fs.existsSync(outPath)) {
    console.error(`File already exists: ${outPath}`);
    process.exit(1);
  }

  const md = `---
layout: layouts/job.njk
title: "Vishnu Haridas — ${role}"
company: "${company}"
role: "${role}"
slug: "${slug}"
date: "${todayISO()}"
# IMPORTANT: After you generate PDFs + upload to Google Drive,
# replace these with Drive share links (not local paths)
downloads:
  resumeUrl: ""
  coverLetterUrl: ""
---

## Summary
_TODO: Paste from ChatGPT output_

## Why I'm a fit
_TODO: Paste from ChatGPT output_

## Resume
_TODO: Paste resume content from ChatGPT output_

## Cover Letter
_TODO: Paste cover letter content from ChatGPT output_

## Job Description
_TODO: Paste the JD you used_
`;

  fs.writeFileSync(outPath, md, "utf8");

  // Print the prompt you paste into ChatGPT
  const prompt = `
You are generating a tailored job-application page in Markdown.

CONTEXT:
- Candidate profile JSON will be provided below.
- You will also be provided the full Job Description text.

OUTPUT REQUIREMENTS (STRICT):
- Output ONLY Markdown that I can paste directly into src/jobs/${slug}.md
- Must include these sections EXACTLY (same headings):
  ## Summary
  ## Why I'm a fit
  ## Resume
  ## Cover Letter
  ## Job Description
- No placeholders like [Your Email], no fake metrics, no invented employers/projects.
- Use concise, factual bullets. If you need a number and it isn't in the profile, omit it.
- Resume section: include a tight “Highlights” subsection + “Experience” bullets aligned to the JD.
- Cover letter: 250–350 words, human tone, no AI-sounding fluff.
- Include a short keyword pack at the end of "Why I'm a fit" (5–12 keywords) matching the JD.

CANDIDATE PROFILE JSON:
<<PASTE src/_data/profile.json HERE>>

JOB DESCRIPTION:
<<PASTE THE JOB DESCRIPTION TEXT HERE>>
`.trim();

  console.log("\n✅ Created:", outPath);
  console.log("\n--- PASTE THIS PROMPT INTO CHATGPT ---\n");
  console.log(prompt);
  console.log("\n--- END PROMPT ---\n");
})();
