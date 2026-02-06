# LinkedIn Post Scraper

This scraper extracts the full content from your LinkedIn posts and adds it to the `linkedin-posts.json` file.

## Setup

1. Install dependencies:
```bash
cd scrapper
npm install
```

## Usage

1. Make sure you're logged into LinkedIn in your Chrome browser
2. Run the scraper:
```bash
npm run scrape
```

3. The browser will open automatically
   - If prompted, log into LinkedIn
   - Press Enter in the terminal when you're ready to start scraping
   - The script will visit each post URL and extract the content
   - Content will be automatically added to your posts in `linkedin-posts.json`

## How it works

- Uses Puppeteer to control a Chrome browser
- Opens in non-headless mode so you can interact and login
- Extracts post content using multiple selector strategies
- Updates the existing `linkedin-posts.json` file with a new `content` field
- Preserves all existing data (title, excerpt, likes, etc.)

## After scraping

Once you've successfully scraped the content, you can delete this entire `scrapper` folder as the data will be saved in `linkedin-posts.json`.

## Troubleshooting

- **Can't find content**: Some posts may have different HTML structure. You may need to inspect the page and update the selectors in `scrape-posts.js`
- **Rate limiting**: The script waits 2 seconds between requests. If you get blocked, increase this delay
- **Login required**: Make sure you complete the login in the browser window before pressing Enter
