# DevDigest

A developer awareness platform that aggregates CS knowledge, security advisories, and CVE data — updated daily via GitHub Actions.

> Built with React + Vite + Tailwind CSS. Deployed on GitHub Pages. Data pipeline powered by Python + GitHub Actions.

---

## Features

- 🏠 **Home** — Daily CS term spotlight with recent additions
- 📖 **Glossary** — CS terms auto-collected from Wikipedia, searchable and filterable
- 🧠 **Quiz** — Flashcard and multiple choice modes from glossary data
- 🔐 **Security Cases** — Real-world breaches and CVEs from GitHub Advisory DB + NVD

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
│   ├── CS_Glossary.json       # Auto-updated by Glossary workflow
│   └── CaseStudies.json       # Auto-updated by Advisory + NVD workflows
├── scripts/
│   ├── Glossary.py            # Wikipedia CS term collector
│   ├── GitHubAdvisory.py      # GitHub Advisory Database collector
│   └── NVDCollector.py        # NIST NVD CVE collector
└── .github/workflows/
    ├── daily-gloss.yml        # Runs Glossary.py (2x daily)
    ├── github-advisory.yml    # Runs GitHubAdvisory.py (daily, 07:00 UTC)
    ├── nvd-collector.yml      # Runs NVDCollector.py (daily, 08:00 UTC)
    └── deploy.yml             # Builds and deploys to GitHub Pages on push
```

---

## Local Development

```bash
npm install
npm run dev
```

The app fetches `CS_Glossary.json` and `CaseStudies.json` from the `public/` folder.
The existing JSON files are included so the app works immediately without running collectors.

---

## Data Pipeline

### Glossary
Runs at 06:00 and 21:00 UTC. Picks a random Wikipedia article from 12 CS categories and appends it to `public/CS_Glossary.json`.

### GitHub Advisory
Runs at 07:00 UTC daily. Uses the GitHub GraphQL API (`securityAdvisories`) to fetch the latest advisories. The `GITHUB_TOKEN` secret is automatically available in GitHub Actions — no setup needed.

### NVD / CVE
Runs at 08:00 UTC daily. Queries the NIST NVD REST API v2 for CVEs published in the last 3 days.

**Optional:** Add an `NVD_API_KEY` secret in your repo settings (Settings → Secrets → Actions) for higher rate limits. Get a free key at [nvd.nist.gov/developers/request-an-api-key](https://nvd.nist.gov/developers/request-an-api-key).

---

## Deployment (GitHub Pages)

1. Go to **Settings → Pages** in your repo
2. Set Source to **GitHub Actions**
3. Push to `main` — the `deploy.yml` workflow builds and deploys automatically

---

## GitHub Developer Program

This project integrates with:
- **GitHub Advisory Database API** (GraphQL) — `https://api.github.com/graphql`
- **GitHub Actions** for scheduled automation

Register at [github.com/developer/program](https://github.com/developer/program).
