import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your LinkedIn profile username
const LINKEDIN_USERNAME = 'shritej-koneru-560111324';

// Load existing posts data
const postsFilePath = path.join(__dirname, '../client/src/data/linkedin-posts.json');
let existingPosts = [];
try {
  const fileContent = fs.readFileSync(postsFilePath, 'utf-8');
  existingPosts = JSON.parse(fileContent);
} catch (error) {
  console.log('Could not load existing posts, starting fresh');
}

async function discoverPosts(page, username) {
  console.log(`\nDiscovering posts from profile: ${username}`);
  
  try {
    // Try profile page first
    const profileUrl = `https://www.linkedin.com/in/${username}/`;
    console.log('Loading profile page...');
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Now try activity page
    console.log('Navigating to recent activity...');
    const activityUrl = `https://www.linkedin.com/in/${username}/recent-activity/all/`;
    await page.goto(activityUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for posts to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('Scrolling to load more posts...');
    
    // Scroll down multiple times to load more posts
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Extract activity IDs and construct post URLs
    const postUrls = await page.evaluate((username) => {
      const activityIds = new Set();
      
      // Strategy 1: Extract from analytics links
      document.querySelectorAll('a[href*="/analytics/post-summary/"]').forEach(el => {
        const match = el.href.match(/activity[:-](\d+)/);
        if (match) {
          activityIds.add(match[1]);
        }
      });
      
      // Strategy 2: Extract from data attributes
      document.querySelectorAll('[data-urn*="activity"]').forEach(el => {
        const urn = el.getAttribute('data-urn');
        const match = urn.match(/activity[:-](\d+)/);
        if (match) {
          activityIds.add(match[1]);
        }
      });
      
      // Strategy 3: Look for existing post links
      document.querySelectorAll('a[href*="/posts/"][href*="activity-"]').forEach(el => {
        const match = el.href.match(/activity-(\d+)/);
        if (match) {
          activityIds.add(match[1]);
        }
      });
      
      // Strategy 4: Extract from any links or text containing activity IDs
      document.querySelectorAll('a').forEach(el => {
        const href = el.href + el.textContent;
        const match = href.match(/activity[:-](\d+)/);
        if (match && match[1].length > 15) { // Activity IDs are long numbers
          activityIds.add(match[1]);
        }
      });
      
      // Construct proper post URLs from activity IDs
      const urls = [];
      activityIds.forEach(id => {
        const url = `https://www.linkedin.com/posts/${username}_activity-${id}`;
        urls.push(url);
      });
      
      return urls;
    }, LINKEDIN_USERNAME);
    
    console.log(`Found ${postUrls.length} post activity IDs`);
    
    if (postUrls.length === 0) {
      console.log('\n⚠️  No posts found with automatic discovery');
      console.log('Falling back to existing post URLs from JSON...');
      
      // Fallback: use existing URLs from the JSON file
      const existingUrls = existingPosts
        .filter(post => post.link && post.link.includes('/posts/'))
        .map(post => post.link.split('?')[0]);
      
      return existingUrls;
    }
    
    return postUrls;
    
  } catch (error) {
    console.error('Error discovering posts:', error.message);
    console.log('\nℹ️  Falling back to posts from linkedin-posts.json');
    
    // Fallback: use existing URLs from the JSON file
    const existingUrls = existingPosts
      .filter(post => post.link && post.link.includes('/posts/'))
      .map(post => post.link.split('?')[0]);
    
    return existingUrls;
  }
}

async function scrapeLinkedInPost(page, url, index) {
  console.log(`\nScraping post ${index + 1}: ${url}`);
  
  try {
    // Try multiple URL formats for the same activity ID
    const activityId = url.match(/activity-?(\d+)/)?.[1];
    const urlsToTry = [
      url,
      `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}/`,
      `https://www.linkedin.com/feed/update/urn:li:share:${activityId}/`
    ];
    
    let postData = null;
    for (const tryUrl of urlsToTry) {
      try {
        await page.goto(tryUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // Check if we got an error page
        const hasError = await page.evaluate(() => {
          return document.body.innerText.includes('Something went wrong') || 
                 document.body.innerText.includes('This content isn\'t available');
        });
        
        if (hasError) {
          console.log(`  ✗ Error page, trying next URL format...`);
          continue;
        }
        
        // Try to extract content
        postData = await extractPostContent(page);
        
        if (postData.content && postData.content.length > 50 && !postData.content.includes('Something went wrong')) {
          postData.url = tryUrl;
          break;
        }
      } catch (e) {
        console.log(`  ✗ Failed with URL format, trying next...`);
        continue;
      }
    }
    
    if (postData && postData.content && !postData.content.includes('Something went wrong')) {
      console.log(`✓ Successfully scraped content`);
      console.log(`  Date: ${postData.date || 'N/A'}`);
      console.log(`  Likes: ${postData.likes || 0}`);
      console.log(`  Content preview: ${postData.content.substring(0, 100)}...`);
      return postData;
    } else {
      console.log(`✗ Could not find valid content`);
      return { url, content: null };
    }
    
  } catch (error) {
    console.error(`Error scraping post:`, error.message);
    return { url, content: null };
  }
}

async function extractPostContent(page) {
  // Try to click "see more" if it exists
  try {
    const seeMoreButton = await page.$('.feed-shared-inline-show-more-text__see-more-less-toggle, .feed-shared-text__see-more-link');
    if (seeMoreButton) {
      await seeMoreButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (e) {
    // Ignore if button not found
  }
  
  // Extract post data
  const postData = await page.evaluate(() => {
    // Try different selectors for post content
    const contentSelectors = [
      '.feed-shared-update-v2__description',
      '.feed-shared-text',
      '.feed-shared-inline-show-more-text',
      '[data-test-id="main-feed-activity-card__commentary"]',
      '.feed-shared-update-v2__commentary',
      '.feed-shared-text-view',
      '.update-components-text',
      '.break-words'
    ];
    
    let content = null;
    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = (element.innerText || element.textContent || '').trim();
        // Make sure it's substantial content and not error messages
        if (text && text.length > 50 && !text.includes('Something went wrong') && !text.includes('Refresh the page')) {
          content = text;
          break;
        }
      }
      if (content) break;
    }
    
    // Extract date
    let date = null;
    const dateSelectors = [
      '.feed-shared-actor__sub-description time',
      'time[datetime]',
      '[data-test-id="feed-shared-actor__sub-description"] time',
      '.update-components-actor__sub-description time'
    ];
    for (const selector of dateSelectors) {
      const dateElement = document.querySelector(selector);
      if (dateElement) {
        date = dateElement.getAttribute('datetime');
        break;
      }
    }
    
    // Extract engagement counts
    let likes = 0;
    const likesSelectors = [
      '.social-details-social-counts__reactions-count',
      '[data-test-id="social-actions__reaction-count"]',
      '.social-details-social-counts__count-value'
    ];
    for (const selector of likesSelectors) {
      const likesElement = document.querySelector(selector);
      if (likesElement) {
        const likesText = likesElement.textContent.trim();
        const match = likesText.match(/[\d,]+/);
        if (match) {
          likes = parseInt(match[0].replace(/,/g, '')) || 0;
        }
        break;
      }
    }
    
    let comments = 0;
    const commentsElement = document.querySelector('.social-details-social-counts__comments, [data-test-id="social-actions__comment-count"]');
    if (commentsElement) {
      const commentsText = commentsElement.textContent.trim();
      comments = parseInt(commentsText.match(/\d+/)?.[0]) || 0;
    }
    
    return { content, date, likes, comments };
  });
  
  return postData;
}

async function main() {
  console.log('Starting LinkedIn post scraper...');
  console.log('⚠️  IMPORTANT: You need to be logged into LinkedIn in your default Chrome browser');
  console.log('⚠️  The browser will open in non-headless mode so you can login if needed\n');
  
  // Launch browser with user data to use existing login
  const browser = await puppeteer.launch({
    headless: false, // Set to false so you can see and interact
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ]
  });
  
  const page = await browser.newPage();
  
  // Set a realistic user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log('Opening LinkedIn... Please login if prompted and press Enter when ready');
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle2' });
  
  // Wait for user to confirm they're logged in
  console.log('\n⏸️  Paused. Please ensure you are logged in, then press Enter to continue...');
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  // Step 1: Discover all post URLs from profile
  const postUrls = await discoverPosts(page, LINKEDIN_USERNAME);
  
  if (postUrls.length === 0) {
    console.log('❌ No posts found. Make sure you are logged in and the profile is accessible.');
    await browser.close();
    return;
  }
  
  // Step 2: Scrape content from each post
  const scrapedPosts = [];
  for (let i = 0; i < postUrls.length; i++) {
    const postData = await scrapeLinkedInPost(page, postUrls[i], i);
    if (postData.content) {
      scrapedPosts.push(postData);
    }
    // Wait between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  await browser.close();
  
  // Step 3: Match scraped posts with existing posts or add as new
  console.log('\n\nProcessing scraped posts...');
  
  // Update existing posts with scraped content
  existingPosts.forEach(post => {
    // Try to match by date or content similarity
    const matchedPost = scrapedPosts.find(scraped => {
      if (scraped.date && post.date) {
        return scraped.date.startsWith(post.date);
      }
      // Fallback: match by excerpt similarity
      if (post.excerpt && scraped.content) {
        return scraped.content.includes(post.excerpt.substring(0, 50));
      }
      return false;
    });
    
    if (matchedPost) {
      post.content = matchedPost.content;
      post.link = matchedPost.url;
      if (matchedPost.likes) post.likes = matchedPost.likes;
      if (matchedPost.comments) post.comments = matchedPost.comments;
      console.log(`✓ Updated post ${post.id}: "${post.title}"`);
      
      // Remove from scrapedPosts to avoid duplicates
      const index = scrapedPosts.indexOf(matchedPost);
      if (index > -1) scrapedPosts.splice(index, 1);
    }
  });
  
  // Add any remaining scraped posts as new entries
  let nextId = Math.max(...existingPosts.map(p => p.id)) + 1;
  scrapedPosts.forEach(scraped => {
    const newPost = {
      id: nextId++,
      title: scraped.content.split('\n')[0].substring(0, 60) + '...',
      excerpt: scraped.content.substring(0, 200) + '...',
      content: scraped.content,
      type: 'post',
      link: scraped.url,
      date: scraped.date ? scraped.date.split('T')[0] : new Date().toISOString().split('T')[0],
      likes: scraped.likes || 0,
      comments: scraped.comments || 0
    };
    existingPosts.push(newPost);
    console.log(`✓ Added new post ${newPost.id}`);
  });
  
  // Sort by date (newest first)
  existingPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Save updated posts
  fs.writeFileSync(postsFilePath, JSON.stringify(existingPosts, null, 2));
  console.log(`\n✅ Successfully updated ${postsFilePath}`);
  console.log(`\nTotal posts with content: ${existingPosts.filter(p => p.content).length}/${existingPosts.length}`);
}

main().catch(console.error);
