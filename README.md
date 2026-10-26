# DevDigest

A developer awareness platform that aggregates CS knowledge, security advisories, and CVE data. Content is updated automatically every day through GitHub Actions.

> Built with React, Vite, and Tailwind CSS. Deployed on GitHub Pages. The data pipeline runs on Python and GitHub Actions.

---

## Features

- **Home**: daily CS term spotlight with recent additions and platform stats
- **Glossary**: CS terms collected from Wikipedia, with search, category filtering, and sorting
- **Flashcards**: study glossary terms in a flip-card quiz mode
- **Security Feed**: real-world breaches, advisories, and CVEs from the GitHub Advisory Database and NIST NVD
- **Dark UI**: responsive layout with a custom Tailwind theme and locally bundled fonts

---

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Data collection | Python 3, `requests` |
| Automation | GitHub Actions |
| Hosting | GitHub Pages |

---

## Project Structure

```
DevDigest/
├── src/
│   ├── components/
│   │   ├── Nav.jsx
│   │   ├── Home.jsx
│   │   ├── Glossary.jsx
│   │   ├── Quiz.jsx
│   │   └── Cases.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   ├── CS_Glossary.json       # Auto-updated by the Glossary workflow
│   └── CaseStudies.json       # Auto-updated by the Advisory and NVD workflows
├── scripts/
│   ├── Glossary.py            # Wikipedia CS term collector
│   ├── GitHubAdvisory.py      # GitHub Advisory Database collector
│   └── NVDCollector.py        # NIST NVD CVE collector
└── .github/workflows/
    ├── daily-gloss.yml        # Runs Glossary.py (2x daily)
    ├── github-advisory.yml    # Runs GitHubAdvisory.py (daily, 07:00 UTC)
    ├── nvd-collector.yml      # Runs NVDCollector.py (daily, 08:00 UTC)
    └── deploy.yml             # Builds and deploys to GitHub Pages
```

---

## Local Development

Requirements:

- Node.js 18 or newer
- npm

```bash
npm install
npm run dev
```

The app fetches `CS_Glossary.json` and `CaseStudies.json` from the `public/` folder at runtime. Both JSON files are committed to the repository, so the app works immediately without running any collectors.

To create a production build:

```bash
npm run build
npm run preview
```

---

## Data Pipeline

All collectors are plain Python scripts that write to the JSON files in `public/`. Each workflow commits its changes back to `main`, so the data stays in sync with the deployed site.

### Glossary

Runs at 06:00 and 21:00 UTC. Picks a random Wikipedia article from 12 CS categories, extracts its summary, and appends it to `public/CS_Glossary.json`. Existing topics are skipped to avoid duplicates.

### GitHub Advisory

Runs at 07:00 UTC daily. Uses the GitHub GraphQL API (`securityAdvisories`) to fetch the latest advisories and merges them into `public/CaseStudies.json`. The `GITHUB_TOKEN` secret is provided automatically by GitHub Actions, so no extra setup is needed.

### NVD / CVE

Runs at 08:00 UTC daily. Queries the NIST NVD REST API v2 for CVEs published in the last 3 days and merges them into `public/CaseStudies.json`.

**Optional:** Add an `NVD_API_KEY` secret in your repository settings (Settings > Secrets and variables > Actions) for higher rate limits. You can request a free key at [nvd.nist.gov/developers/request-an-api-key](https://nvd.nist.gov/developers/request-an-api-key).

---

## Deployment (GitHub Pages)

1. Go to **Settings > Pages** in your repository
2. Set **Source** to **GitHub Actions**
3. Push to `main`. The `deploy.yml` workflow builds the app and deploys it automatically

The deploy workflow also runs on a daily schedule at 16:30 UTC (10:00 PM IST) so that newly committed data is published without a manual push. You can trigger it manually from the Actions tab at any time.

---

## GitHub Developer Program

This project integrates with:

- **GitHub Advisory Database API** (GraphQL): `https://api.github.com/graphql`
- **GitHub Actions** for scheduled data collection and deployment
