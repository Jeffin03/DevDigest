# News Data Collector

This Python script automatically collects the latest tech news and Hacker News stories using GitHub Actions. It runs on a schedule of 5:30 GMT daily, gathers top stories from multiple sources, and commits the data to the repository for tracking and analysis.

## Features

- Automatic news data collection (Hacker News & Tech News)
- Scheduled execution using GitHub Actions
- Collects story titles, URLs, and scores
- Commits and pushes data to repository daily

## Prerequisites

Before running this script, make sure you have the following:

- Python 3 installed on your machine
- A GitHub account
- Access to the repository where you want to store the news data

## Usage

1. Clone the repository to your local machine:

   ```bash
   git clone <your-repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd <repository-name>
   ```

3. Install the required Python packages:

   ```bash
   pip install requests
   ```

4. Run the collector locally to test it:

   ```bash
   python Collector.py
   ```

5. The workflow file is already set up in `.github/workflows/daily-collect.yml`. Once you push this repository to GitHub, the workflow will automatically:
   - Run daily at 5:30 GMT
   - Collect the latest stories
   - Commit changes to `NewsData.csv`

6. Commit and push to GitHub:

   ```bash
   git add .
   git commit -m "Setup news data collection"
   git push
   ```

7. Go to your GitHub repository and navigate to the "Actions" tab to see the workflow runs.

The script will now run automatically according to the specified schedule, collect top stories from Hacker News and tech news sources, and commit the changes to the repository. The collected data will be stored in the `NewsData.csv` file with columns: Date, Source, Title, URL, and Score.

