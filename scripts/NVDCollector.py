"""
NVDCollector.py
Fetches recent CVEs from the NIST NVD REST API v2 and merges them
into public/CaseStudies.json alongside GitHub Advisory data.

No API key required for low-volume use (5 req/30s unauthenticated).
Set NVD_API_KEY env var for higher rate limits.

Schedule: Run via .github/workflows/nvd-collector.yml
"""

import json
import os
import time
import requests
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'public', 'CaseStudies.json')
NVD_API_KEY = os.environ.get('NVD_API_KEY', '')

BASE_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0'
HEADERS = {'User-Agent': 'DevDigest-Bot/1.0'}
if NVD_API_KEY:
    HEADERS['apiKey'] = NVD_API_KEY

# Fetch CVEs published in the last N days per run
LOOKBACK_DAYS = 3
RESULTS_PER_PAGE = 20


def load_existing():
    if not os.path.exists(OUTPUT_FILE):
        return [], set()
    try:
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        existing_ids = {row.get('id') for row in data if row.get('id')}
        return data, existing_ids
    except Exception as e:
        print(f'Warning: could not read {OUTPUT_FILE}: {e}')
        return [], set()


def cvss_to_severity(score):
    if score is None:
        return 'low'
    if score >= 9.0:
        return 'critical'
    if score >= 7.0:
        return 'high'
    if score >= 4.0:
        return 'medium'
    return 'low'


def extract_cvss(metrics):
    """Try v3.1 → v3.0 → v2 CVSS score."""
    for key in ('cvssMetricV31', 'cvssMetricV30', 'cvssMetricV2'):
        items = metrics.get(key, [])
        if items:
            data = items[0].get('cvssData', {})
            score = data.get('baseScore')
            if score is not None:
                return float(score)
    return None


def cve_to_rows(item):
    cve = item.get('cve', {})
    cve_id = cve.get('id', '')
    published = (cve.get('published') or '')[:10]
    year = published[:4]

    # Description (English preferred)
    descs = cve.get('descriptions', [])
    description = next((d['value'] for d in descs if d.get('lang') == 'en'), '')
    description = description[:500]

    # Severity via CVSS
    metrics = cve.get('metrics', {})
    cvss_score = extract_cvss(metrics)
    severity = cvss_to_severity(cvss_score)

    # Affected products
    configs = cve.get('configurations', [])
    affected_parts = []
    for cfg in configs[:1]:
        for node in cfg.get('nodes', [])[:2]:
            for match in node.get('cpeMatch', [])[:2]:
                criteria = match.get('criteria', '')
                parts = criteria.split(':')
                if len(parts) > 4:
                    affected_parts.append(f"{parts[3]} {parts[4]}")
    affected = ', '.join(affected_parts[:3]) if affected_parts else None

    # Source URL
    refs = cve.get('references', [])
    source_url = next(
        (
            r['url']
            for r in refs
            if (
                isinstance(r.get('url'), str)
                and urlparse(r['url']).hostname == 'nvd.nist.gov'
            )
        ),
        f'https://nvd.nist.gov/vuln/detail/{cve_id}'
    )

    # Short title from description
    title = description[:100].rstrip('.') + '…' if len(description) > 100 else description
    if not title:
        title = cve_id

    base_row = {
        'id':         cve_id,
        'title':      title,
        'type':       'cve',
        'severity':   severity,
        'year':       year,
        'affected':   affected,
        'summary':    description,
        'source_url': source_url,
        'cve_id':     cve_id,
        'source':     'nvd',
        'event_date':  None,
        'event_title': None,
        'event_desc':  None,
    }

    rows = [base_row]

    # Timeline: published event
    rows.append({
        **base_row,
        'event_date':  published,
        'event_title': 'CVE Published',
        'event_desc':  f'CVSS Score: {cvss_score}' if cvss_score else 'Score not yet available',
    })

    return rows


def fetch_recent_cves():
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=LOOKBACK_DAYS)
    params = {
        'pubStartDate': start.strftime('%Y-%m-%dT%H:%M:%S.000'),
        'pubEndDate':   end.strftime('%Y-%m-%dT%H:%M:%S.000'),
        'resultsPerPage': RESULTS_PER_PAGE,
    }
    resp = requests.get(BASE_URL, headers=HEADERS, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json().get('vulnerabilities', [])


def save(all_rows):
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_rows, f, indent=2, ensure_ascii=False)


def main():
    existing_rows, existing_ids = load_existing()
    print(f'Existing entries: {len(existing_ids)}')

    try:
        items = fetch_recent_cves()
    except Exception as e:
        print(f'ERROR fetching NVD: {e}')
        return

    new_rows = []
    for item in items:
        cve_id = item.get('cve', {}).get('id', '')
        if cve_id in existing_ids:
            continue
        rows = cve_to_rows(item)
        new_rows.extend(rows)
        existing_ids.add(cve_id)
        time.sleep(0.1)

    if not new_rows:
        print('No new CVEs found.')
        return

    all_rows = existing_rows + new_rows
    save(all_rows)
    print(f'Added {len(new_rows)} rows from {len(items)} CVEs. Total: {len(all_rows)}')


if __name__ == '__main__':
    main()
