import requests
from bs4 import BeautifulSoup

def scrape_instagram_images(instagram_url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    response = requests.get(instagram_url, headers=headers)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        images = []
        for img in soup.find_all('img'):
            images.append(img['src'])
        return images
    else:
        print(f"Failed to retrieve the page. Status code: {response.status_code}")
        return []

# Example usage:
if __name__ == "__main__":
    instagram_url = "https://www.instagram.com/"
    images = scrape_instagram_images(instagram_url)
    print(images)
