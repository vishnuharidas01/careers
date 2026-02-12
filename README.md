# Career Pages

A static site generator for job applications using Eleventy (11ty).

## Features

- Generate personalized career pages for each job application
- Resume and cover letter downloads
- Job-specific content and styling
- Easy deployment with GitHub Actions

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Creating a New Job Application

Use the provided script to create a new job application:

```bash
./scripts/new-job.sh "Company Name" "Job Title"
```

This will:
- Create a new markdown file in `src/jobs/`
- Generate resume and cover letter PDFs
- Update the site data

## Project Structure

```
career-pages/
├── src/
│   ├── _data/          # Site data and configuration
│   ├── assets/         # CSS, JS, and images
│   ├── _includes/      # Templates and components
│   ├── jobs/           # Job application markdown files
│   └── downloads/      # Generated PDFs
├── scripts/            # Utility scripts
└── .github/workflows/  # CI/CD workflows
```

## Deployment

The site is automatically deployed to GitHub Pages when pushing to the main branch.