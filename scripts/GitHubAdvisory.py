"""
GitHubAdvisory.py
Fetches security advisories from the GitHub Advisory Database (GraphQL API)
and appends them to public/CaseStudies.json in the format the UI expects.

Requires: GITHUB_TOKEN env var (read:security_advisories scope)
Schedule: Run via .github/workflows/github-advisory.yml
"""

import json
import os
import time
import requests
from datetime import datetime

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'public', 'CaseStudies.json')
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')

GRAPHQL_URL = 'https://api.github.com/graphql'
HEADERS = {
    'Authorization': f'Bearer {GITHUB_TOKEN}',
    'Content-Type': 'application/json',
    'User-Agent': 'DevDigest-Bot/1.0',
}

# Fetch N advisories per run (stay well within rate limits)
FETCH_PER_RUN = 10

QUERY = """
query($cursor: String) {
  securityAdvisories(first: 20, after: $cursor, orderBy: {field: PUBLISHED_AT, direction: DESC}) {
    pageInfo { hasNextPage endCursor }
    nodes {
      ghsaId
      summary
      description
      severity
      publishedAt
      references { url }
      identifiers { type value }
      vulnerabilities(first: 5) {
        nodes {
          package { name ecosystem }
          vulnerableVersionRange
          firstPatchedVersion { identifier }
        }
      }
    }
  }
}
"""


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


def fetch_advisories(cursor=None):
    payload = {'query': QUERY, 'variables': {'cursor': cursor}}
    resp = requests.post(GRAPHQL_URL, headers=HEADERS, json=payload, timeout=20)
    resp.raise_for_status()
    data = resp.json()
    if 'errors' in data:
        raise RuntimeError(f"GraphQL errors: {data['errors']}")
    return data['data']['securityAdvisories']


def severity_map(s):
    return {'CRITICAL': 'critical', 'HIGH': 'high', 'MODERATE': 'medium', 'LOW': 'low'}.get(s, 'low')


def advisory_to_rows(node):
    """Convert a GraphQL advisory node into one or more CaseStudies rows."""
    ghsa_id = node.get('ghsaId', '')
    summary = node.get('summary', '').strip()
    description = (node.get('description') or '').strip()[:500]
    severity = severity_map(node.get('severity', 'LOW'))
    published = (node.get('publishedAt') or '')[:10]
    year = published[:4] if published else ''

    # CVE identifier
    cve_id = next(
        (i['value'] for i in node.get('identifiers', []) if i['type'] == 'CVE'),
        None
    )

    # Source URL — prefer CVE advisory page, else first reference
    refs = [r['url'] for r in node.get('references', []) if r.get('url')]
    source_url = next((u for u in refs if 'nvd.nist.gov' in u or 'github.com/advisories' in u), refs[0] if refs else '')

    # Affected packages for title
    vulns = node.get('vulnerabilities', {}).get('nodes', [])
    affected_packages = ', '.join(
        f"{v['package']['name']} ({v['package']['ecosystem']})"
        for v in vulns[:3] if v.get('package')
    )

    title = summary[:120] if summary else ghsa_id
    full_summary = description if description else summary

    base_row = {
        'id':         ghsa_id,
        'title':      title,
        'type':       'cve' if cve_id else 'research',
        'severity':   severity,
        'year':       year,
        'affected':   affected_packages or None,
        'summary':    full_summary,
        'source_url': source_url,
        'cve_id':     cve_id,
        'source':     'github_advisory',
        # timeline events (patch info)
        'event_date':  None,
        'event_title': None,
        'event_desc':  None,
    }

    rows = [base_row]

    # Add timeline events for each vulnerable package with a patch
    for v in vulns:
        patch = v.get('firstPatchedVersion', {})
        if patch and patch.get('identifier'):
            pkg = v.get('package', {})
            rows.append({
                **base_row,
                'event_date':  published,
                'event_title': f"Patch released: {pkg.get('name', '')} {patch['identifier']}",
                'event_desc':  f"Vulnerable range: {v.get('vulnerableVersionRange', 'unknown')}",
            })

    return rows


def save(all_rows):
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_rows, f, indent=2, ensure_ascii=False)


def main():
    if not GITHUB_TOKEN:
        print('ERROR: GITHUB_TOKEN not set.')
        return

    existing_rows, existing_ids = load_existing()
    print(f'Existing entries: {len(existing_ids)}')

    new_rows = []
    cursor = None
    fetched = 0

    while fetched < FETCH_PER_RUN:
        result = fetch_advisories(cursor)
        nodes = result['nodes']

        for node in nodes:
            ghsa_id = node.get('ghsaId', '')
            if ghsa_id in existing_ids:
                continue
            rows = advisory_to_rows(node)
            new_rows.extend(rows)
            existing_ids.add(ghsa_id)
            fetched += 1
            if fetched >= FETCH_PER_RUN:
                break

        if not result['pageInfo']['hasNextPage']:
            break
        cursor = result['pageInfo']['endCursor']
        time.sleep(0.5)

    if not new_rows:
        print('No new advisories found.')
        return

    all_rows = existing_rows + new_rows
    save(all_rows)
    print(f'Added {len(new_rows)} rows from {fetched} new advisories. Total: {len(all_rows)}')


if __name__ == '__main__':
    main()
