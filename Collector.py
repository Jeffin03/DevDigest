# imports
import csv
import requests
from datetime import datetime

# Fetch top Hacker News stories
def get_hackernews_stories(limit=5):
    """Fetch top stories from Hacker News"""
    stories = []
    try:
        # Get top story IDs
        top_ids = requests.get('https://hacker-news.firebaseio.com/v0/topstories.json').json()[:30]
        
        for story_id in top_ids[:limit]:
            story = requests.get(f'https://hacker-news.firebaseio.com/v0/item/{story_id}.json').json()
            if story and 'title' in story:
                stories.append({
                    'source': 'Hacker News',
                    'title': story.get('title', ''),
                    'url': story.get('url', ''),
                    'score': story.get('score', 0)
                })
    except Exception as e:
        print(f"Error fetching Hacker News: {e}")
    
    return stories

# Fetch tech news headlines
def get_tech_news(limit=5):
    """Fetch tech news from a free RSS-to-JSON service"""
    stories = []
    try:
        # Using a free tech news source
        response = requests.get('https://api.hnify.io/top/1', timeout=5)
        if response.status_code == 200:
            data = response.json()
            for item in data[:limit]:
                stories.append({
                    'source': 'Tech News',
                    'title': item.get('title', ''),
                    'url': item.get('url', ''),
                    'score': item.get('points', 0)
                })
    except Exception as e:
        print(f"Error fetching tech news: {e}")
    
    return stories

# Main collection
date = datetime.now().strftime('%Y-%m-%d')
hn_stories = get_hackernews_stories(5)
tech_stories = get_tech_news(5)
all_stories = hn_stories + tech_stories

# Write to CSV
with open('NewsData.csv', 'a', encoding='UTF8') as f:
    writer = csv.writer(f)
    for story in all_stories:
        writer.writerow([date, story['source'], story['title'], story['url'], story['score']])

print(f"Collected {len(all_stories)} stories on {date}")

