#!/usr/bin/env node
/**
 * Generate PDFs from a job markdown file:
 * - Extract "## Resume" section -> resume.pdf
 * - Extract "## Cover Letter" section -> cover-letter.pdf
 *
 * Usage:
 *   node scripts/render-pdf.js --slug mufg-mobile-dev
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const nunjucks = require("nunjucks");
const MarkdownIt = require("markdown-it");
const { chromium } = require("playwright");

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function extractSection(md, heading) {
  // naive but effective: grab content between "## Heading" and next "## "
  const re = new RegExp(`^##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=^##\\s+|\\s*$)`, "m");
  const m = md.match(re);
  return m ? m[1].trim() : "";
}

(async function main() {
  const slug = getArg("--slug");
  if (!slug) {
    console.error("Missing --slug");
    process.exit(1);
  }

  const jobPath = path.join(process.cwd(), "src", "jobs", `${slug}.md`);
  const profilePath = path.join(process.cwd(), "src", "_data", "profile.json");
  const outDir = path.join(process.cwd(), "src", "downloads");
  const tmpDir = path.join(process.cwd(), ".tmp");

  if (!fs.existsSync(jobPath)) {
    console.error("Job file not found:", jobPath);
    process.exit(1);
  }
  if (!fs.existsSync(profilePath)) {
    console.error("profile.json not found:", profilePath);
    process.exit(1);
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const jobRaw = fs.readFileSync(jobPath, "utf8");
  const { data: fm, content } = matter(jobRaw);
  const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));

  const resumeMd = extractSection(content, "Resume");
  const coverMd = extractSection(content, "Cover Letter");

  if (!resumeMd) {
    console.error(`No "## Resume" section found in ${jobPath}`);
    process.exit(1);
  }
  if (!coverMd) {
    console.error(`No "## Cover Letter" section found in ${jobPath}`);
    process.exit(1);
  }

  const md = new MarkdownIt({ html: false, linkify: true });

  const resumeHtml = md.render(resumeMd);
  const coverHtml = md.render(coverMd);

  nunjucks.configure(path.join(process.cwd(), "templates"), { autoescape: true });

  const resumePageHtml = nunjucks.render("pdf/resume.njk", {
    ...profile,
    company: fm.company,
    role: fm.role,
    resumeHtml
  });

  const coverPageHtml = nunjucks.render("pdf/cover-letter.njk", {
    ...profile,
    company: fm.company,
    role: fm.role,
    coverHtml
  });

  const resumeTmp = path.join(tmpDir, `${slug}-resume.html`);
  const coverTmp = path.join(tmpDir, `${slug}-cover-letter.html`);

  fs.writeFileSync(resumeTmp, resumePageHtml, "utf8");
  fs.writeFileSync(coverTmp, coverPageHtml, "utf8");

  const resumePdf = path.join(outDir, `${slug}-resume.pdf`);
  const coverPdf = path.join(outDir, `${slug}-cover-letter.pdf`);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();

    await page.goto(`file://${resumeTmp}`, { waitUntil: "load" });
    await page.pdf({ path: resumePdf, format: "A4", printBackground: true });

    await page.goto(`file://${coverTmp}`, { waitUntil: "load" });
    await page.pdf({ path: coverPdf, format: "A4", printBackground: true });

    console.log("✅ PDFs created:");
    console.log(" -", resumePdf);
    console.log(" -", coverPdf);
  } finally {
    await browser.close();
  }
})();
