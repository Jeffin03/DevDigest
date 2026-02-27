import csv
import requests
import os
import random
from datetime import datetime
import urllib.parse

# --- Configuration ---
# Topics now include a 'term' and a 'label' (category)
TOPIC_DATA = [
    {"term": "SQL Injection", "label": "Cybersecurity"},
    {"term": "Firewall", "label": "Network Security"},
    {"term": "Kubernetes", "label": "DevOps"},
    {"term": "Docker", "label": "DevOps"},
    {"term": "Machine Learning", "label": "Artificial Intelligence"},
    {"term": "Neural Network", "label": "Artificial Intelligence"},
    {"term": "Linux Kernel", "label": "Operating Systems"},
    {"term": "SSH", "label": "Network Protocols"},
    {"term": "Public Key Infrastructure", "label": "Cryptography"},
    {"term": "Recursion", "label": "Programming"},
    {"term": "Git", "label": "Version Control"},
    {"term": "API", "label": "Web Development"},
    {"term": "Cloud Computing", "label": "Infrastructure"},
    {"term": "Blockchain", "label": "Data Structures"},
    {"term": "Virtual Memory", "label": "Operating Systems"},
    {"term": "DNS Spoofing", "label": "Cybersecurity"},
    {"term": "Microservices", "label": "Software Architecture"},
    {"term": "Load Balancing", "label": "Network Infrastructure"},
    {"term": "Python", "label": "Programming Languages"},
    {"term": "Zero Day Exploit", "label": "Cybersecurity"}
]

OUTPUT_FILE = 'CS_Glossary.csv'

def load_todays_topics():
    """
    Load topics added today to prevent duplicates within the same day.
    Returns a set of topic names added today.
    """
    todays_topics = set()
    current_date_str = datetime.now().strftime('%Y-%m-%d')
    
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='UTF8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Check if the row date matches today's date
                    if row.get('date_added') == current_date_str:
                        if row.get('topic'):
                            todays_topics.add(row['topic'].lower().strip())
        except Exception as e:
            print(f"Error reading CSV: {e}")
            
    return todays_topics

def get_wikipedia_definition(topic):
    """
    Fetches summary definition for a topic from Wikipedia REST API.
    Returns a dictionary with title, definition, and url.
    """
    print(f"Fetching definition for: {topic}...")
    
    # 1. Define the User-Agent (Required by Wikipedia)
    headers = {
        'User-Agent': 'DevDigest-Bot/1.0 (jeffin.issac2203@gmail.com)'
    }

    # 2. Use the REST API endpoint (cleaner than the old query API)
    # We encode the topic to handle spaces/special characters
    encoded_topic = urllib.parse.quote(topic)
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded_topic}"

    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        # 3. Handle cases where the page doesn't exist (404)
        if response.status_code == 404:
            print(f"Topic '{topic}' not found on Wikipedia.")
            return None
            
        response.raise_for_status()
        data = response.json()

        # 4. Extract data from the JSON response
        title = data.get('title', topic)
        definition = data.get('extract', '')
        
        # Use the 'content_urls' for the link
        wiki_url = data.get('content_urls', {}).get('desktop', {}).get('page', '')

        if not definition:
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
    file_exists = os.path.exists(OUTPUT_FILE)
    current_date = datetime.now().strftime('%Y-%m-%d')
    
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
    
    print(f"Saved: [{label}] {data['topic']}")

# --- Main Execution ---
if __name__ == "__main__":
    # 1. Get list of topics already added today
    topics_used_today = load_todays_topics()
    
    # 2. Filter the master list to find available topics
    # We exclude topics that have already been added today
    available_topics = [
        t for t in TOPIC_DATA 
        if t['term'].lower() not in topics_used_today
    ]
    
    if not available_topics:
        print("All topics have already been added today. Try again tomorrow or expand the list.")
    else:
        # 3. Pick a random topic from the available list
        selected = random.choice(available_topics)
        term_to_search = selected['term']
        category_label = selected['label']
        
        # 4. Fetch data from Wikipedia
        wiki_data = get_wikipedia_definition(term_to_search)
        
        # 5. Save to CSV
        if wiki_data:
            save_entry(wiki_data, category_label)
        else:
            print(f"Could not find Wikipedia entry for '{term_to_search}'.")