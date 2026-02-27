import csv
import requests
import os
import random
from datetime import datetime
import urllib.parse
import time

# --- Configuration ---
# Instead of specific terms, we define Wikipedia Categories to pull from.
# This gives the script an infinite supply of topics.
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

OUTPUT_FILE = 'CS_Glossary.csv'
API_URL = "https://en.wikipedia.org/w/api.php"

# Use a descriptive User-Agent (Required by Wikipedia Policy)
HEADERS = {
    'User-Agent': 'DevDigest-Bot/1.0 (jeffin.issac2203@gmail.com)'
}

def load_existing_topics():
    """
    Load topics already in the CSV to prevent duplicates forever.
    Returns a set of topic names.
    """
    existing_topics = set()
    
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='UTF8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # We store the topic name to ensure we don't add "Python" twice
                    if row.get('topic'):
                        existing_topics.add(row['topic'].lower().strip())
        except Exception as e:
            print(f"Error reading CSV: {e}")
            
    return existing_topics

def get_random_page_from_category(category_name):
    """
    Fetches a list of pages from a Wikipedia category and returns a random one.
    """
    params = {
        'action': 'query',
        'list': 'categorymembers',
        'cmtitle': category_name,
        'cmlimit': '500',  # Fetch up to 500 pages at a time
        'cmtype': 'page',  # Only get actual pages, ignore subcategories or files
        'format': 'json',
        'cmsort': 'timestamp', # Sort by time to get fresh articles potentially
        'cmdir': 'desc'
    }

    try:
        response = requests.get(API_URL, params=params, headers=HEADERS, timeout=15)
        response.raise_for_status()
        data = response.json()

        pages = data.get('query', {}).get('categorymembers', [])
        
        if not pages:
            return None

        # Filter out pages that are likely lists or disambiguation pages
        valid_pages = [
            p for p in pages 
            if not p['title'].startswith('List of') 
            and '(disambiguation)' not in p['title'].lower()
        ]

        if not valid_pages:
            return None

        # Pick one random page from the list
        return random.choice(valid_pages)['title']

    except Exception as e:
        print(f"Error fetching category {category_name}: {e}")
        return None

def get_wikipedia_definition(topic):
    """
    Fetches summary definition for a topic from Wikipedia REST API.
    """
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
        definition = data.get('extract', '')
        wiki_url = data.get('content_urls', {}).get('desktop', {}).get('page', '')

        # Skip if it's just a list or has no definition
        if not definition or data.get('type') == 'disambiguation':
            return None

        return {
            'topic': title,
            'definition': definition,
            'url': wiki_url
        }

    except Exception as e:
        print(f"Error fetching Wikipedia data: {e}")
        return None

def save_entry(data, label):
    """Saves the retrieved data to the CSV file"""
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    file_exists = os.path.exists(OUTPUT_FILE) and os.path.getsize(OUTPUT_FILE) > 0
    
    with open(OUTPUT_FILE, 'a', newline='', encoding='UTF8') as f:
        fieldnames = ['date_added', 'category', 'topic', 'definition', 'url']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        
        if not file_exists:
            writer.writeheader()
        
        writer.writerow({
            'date_added': current_date,
            'category': label,
            'topic': data['topic'],
            'definition': data['definition'],
            'url': data['url']
        })
    
    print(f"Success! Saved: [{label}] {data['topic']}")

# --- Main Execution ---
if __name__ == "__main__":
    # 1. Load topics we have already collected (to prevent duplicates forever)
    used_topics = load_existing_topics()
    
    # Randomize the categories to ensure we don't always start with "Cybersecurity"
    random.shuffle(CATEGORY_DATA)
    
    topic_found = False
    attempts = 0
    max_attempts = 10 # Safety break to prevent infinite loops if API fails

    while not topic_found and attempts < max_attempts:
        attempts += 1
        
        # 2. Pick a category
        selected_cat = random.choice(CATEGORY_DATA)
        cat_name = selected_cat['category']
        label = selected_cat['label']
        
        print(f"Searching in category: {cat_name}...")
        
        # 3. Get a random page title from that category
        random_title = get_random_page_from_category(cat_name)
        
        if not random_title:
            print(f"No pages found in {cat_name}, trying next category.")
            continue
            
        # 4. Check if we already have this topic
        if random_title.lower().strip() in used_topics:
            print(f"Topic '{random_title}' already exists. Finding another...")
            time.sleep(1) # Small sleep to be polite to the API
            continue
            
        # 5. Fetch the definition
        wiki_data = get_wikipedia_definition(random_title)
        
        # 6. Save if valid
        if wiki_data:
            save_entry(wiki_data, label)
            topic_found = True
        else:
            print(f"Could not fetch definition for {random_title}. Retrying...")
            time.sleep(1)

    if not topic_found:
        print("Failed to find a new unique topic after several attempts.")