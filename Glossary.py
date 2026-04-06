import json
import requests
import os
import random
import re
from datetime import datetime
import urllib.parse
import time

# --- Configuration ---
CATEGORY_DATA = [
    {"category": "Category:Computer security", "label": "Cybersecurity"},
    {"category": "Category:Artificial intelligence", "label": "Artificial Intelligence"},
    {"category": "Category:Software engineering", "label": "Software Engineering"},
    {"category": "Category:Computer networking", "label": "Network Infrastructure"},
    {"category": "Category:Operating systems", "label": "Operating Systems"},
    {"category": "Category:Programming languages", "label": "Programming Languages"},
    {"category": "Category:Web development", "label": "Web Development"},
    {"category": "Category:Database systems", "label": "Data Management"},
    {"category": "Category:Cloud computing", "label": "Infrastructure"},
    {"category": "Category:Cryptography", "label": "Cryptography"},
    {"category": "Category:Data structures", "label": "Data Structures"},
    {"category": "Category:Computer architecture", "label": "Hardware"}
]

OUTPUT_FILE = 'CS_Glossary.json'
API_URL = "https://en.wikipedia.org/w/api.php"
HEADERS = {'User-Agent': 'DevDigest-Bot/1.0 (jeffin.issac2203@gmail.com)'}


def load_existing_topics():
    """Load topics already in the JSON to prevent duplicates."""
    existing_topics = set()
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='UTF8') as f:
                entries = json.load(f)
                for entry in entries:
                    if entry.get('topic'):
                        existing_topics.add(entry['topic'].lower().strip())
        except Exception as e:
            print(f"Error reading JSON: {e}")
    return existing_topics


def get_random_page_from_category(category_name):
    """Fetches a list of pages from a Wikipedia category and returns a random one."""
    params = {
        'action': 'query',
        'list': 'categorymembers',
        'cmtitle': category_name,
        'cmlimit': '500',
        'cmtype': 'page',
        'format': 'json',
        'cmsort': 'timestamp',
        'cmdir': 'desc'
    }
    try:
        response = requests.get(API_URL, params=params, headers=HEADERS, timeout=15)
        response.raise_for_status()
        data = response.json()
        pages = data.get('query', {}).get('categorymembers', [])
        if not pages:
            return None
        valid_pages = [
            p for p in pages
            if not p['title'].startswith('List of')
            and '(disambiguation)' not in p['title'].lower()
        ]
        return random.choice(valid_pages)['title'] if valid_pages else None
    except Exception as e:
        print(f"Error fetching category {category_name}: {e}")
        return None


def clean_definition(text):
    """Strip tabs, newlines, and extra whitespace from a definition string."""
    if not text:
        return text
    text = re.sub(r'[\t\n\r]+', ' ', text)
    text = re.sub(r' {2,}', ' ', text)
    return text.strip()


def get_wikipedia_definition(topic):
    """Fetches and cleans the summary definition for a topic from Wikipedia."""
    print(f"Fetching definition for: {topic}...")
    encoded_topic = urllib.parse.quote(topic)
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded_topic}"
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 404:
            return None
        response.raise_for_status()
        data = response.json()

        title = data.get('title', topic)
        definition = clean_definition(data.get('extract', ''))
        wiki_url = data.get('content_urls', {}).get('desktop', {}).get('page', '')

        if not definition or data.get('type') == 'disambiguation':
            return None

        return {'topic': title, 'definition': definition, 'url': wiki_url}
    except Exception as e:
        print(f"Error fetching Wikipedia data: {e}")
        return None


def save_entry(data, label):
    """Saves the retrieved data to the JSON file."""
    current_date = datetime.now().strftime('%Y-%m-%d')
    new_entry = {
        'date_added': current_date,
        'category': label,
        'topic': data['topic'],
        'definition': data['definition'],
        'url': data['url']
    }
    entries = []
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='UTF8') as f:
                entries = json.load(f)
        except Exception as e:
            print(f"Warning: could not read existing JSON, starting fresh: {e}")
    entries.append(new_entry)
    with open(OUTPUT_FILE, 'w', encoding='UTF8') as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
    print(f"Success! Saved: [{label}] {data['topic']}")


# --- Main Execution ---
if __name__ == "__main__":
    used_topics = load_existing_topics()

    topic_found = False
    attempts = 0
    max_attempts = 10

    while not topic_found and attempts < max_attempts:
        attempts += 1

        selected_cat = random.choice(CATEGORY_DATA)
        cat_name = selected_cat['category']
        label = selected_cat['label']
        print(f"Searching in category: {cat_name}...")

        random_title = get_random_page_from_category(cat_name)
        if not random_title:
            print(f"No pages found in {cat_name}, trying next category.")
            continue

        if random_title.lower().strip() in used_topics:
            print(f"Topic '{random_title}' already exists. Finding another...")
            time.sleep(1)
            continue

        wiki_data = get_wikipedia_definition(random_title)
        if wiki_data:
            save_entry(wiki_data, label)
            topic_found = True
        else:
            print(f"Could not fetch definition for {random_title}. Retrying...")
            time.sleep(1)

    if not topic_found:
        print("Failed to find a new unique topic after several attempts.")
