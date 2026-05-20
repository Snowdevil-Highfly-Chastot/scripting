import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def download_images(url, output_folder="downloaded_images"):
    """
    Scrapes a webpage and downloads all images found in <img> tags.
    """
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"Created directory: {output_folder}")

    try:
        # 1. Fetch the webpage content
        print(f"Fetching webpage: {url}")
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'} # Basic headers to prevent blocking
        response = requests.get(url, headers=headers)
        response.raise_for_status() # Raise an exception for bad status codes
    except requests.exceptions.RequestException as e:
        print(f"Error fetching the webpage: {e}")
        return

    # 2. Parse the HTML content
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # 3. Find all <img> tags
    image_tags = soup.find_all('img')
    print(f"Found {len(image_tags)} image tags on the page.")

    downloaded_count = 0

    # 4. Extract URLs and download each image
    for index, img in enumerate(image_tags):
        img_url = img.get('src')
        
        # Some images might use 'data-src' for lazy loading
        if not img_url:
            img_url = img.get('data-src')
            
        if not img_url:
            continue # Skip if no source URL is found

        # Make the image URL absolute if it is relative
        img_url = urljoin(url, img_url)

        try:
            # Fetch the actual image data
            img_response = requests.get(img_url, stream=True, headers=headers)
            img_response.raise_for_status()

            # Generate a filename from the URL
            parsed_url = urlparse(img_url)
            filename = os.path.basename(parsed_url.path)

            # If the URL doesn't end with a proper filename, create a generic one
            if not filename or '.' not in filename[-5:]:
                content_type = img_response.headers.get('content-type')
                ext = 'jpg' # Default extension
                if content_type and '/' in content_type:
                    ext = content_type.split('/')[-1]
                filename = f"image_{index}.{ext}"

            filepath = os.path.join(output_folder, filename)

            # Save the image to the local disk
            with open(filepath, 'wb') as f:
                for chunk in img_response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            
            print(f"Downloaded: {filename}")
            downloaded_count += 1

        except requests.exceptions.RequestException as e:
            print(f"Failed to download {img_url}: {e}")

    print(f"\nFinished! Successfully downloaded {downloaded_count} images to the '{output_folder}' folder.")

# --- How to use the script ---
if __name__ == "__main__":
    # Replace this with the URL of the webpage you want to scrape
    target_url = "https://en.wikipedia.org/wiki/Python_(programming_language)" 
    
    # You can customize the folder name where images will be saved
    destination_folder = "python_wiki_images"
    
    download_images(target_url, destination_folder)
