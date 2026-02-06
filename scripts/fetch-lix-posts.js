/**
 * Semi-automated script to fetch LinkedIn post details using Lix API
 * Usage: node scripts/fetch-lix-posts.js
 * 
 * You provide post URNs, it fetches full details and updates JSON
 */

import fs from 'fs/promises';
import path from 'path';

const LIX_API_KEY = process.env.LIX_API_KEY || 'YOUR_API_KEY_HERE';

// Add your LinkedIn post URNs here
// Get URN from post URL: linkedin.com/posts/...activity-7424382734967562241-...
const POST_URNS = [
  'urn:li:activity:7424382734967562241', // Quantum post
  'urn:li:activity:YOUR_POST_ID_HERE',
  // Add more URNs...
];

async function fetchPostDetails(postUrn) {
  const encodedUrn = encodeURIComponent(postUrn);
  const url = `https://api.lix-it.com/v1/enrich/post?post_urn=${encodedUrn}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': LIX_API_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch post ${postUrn}: ${response.statusText}`);
  }
  
  return response.json();
}

function transformLixToOurFormat(lixPost, index) {
  return {
    id: index + 1,
    title: lixPost.text?.substring(0, 60) + '...' || 'LinkedIn Post',
    excerpt: lixPost.text?.substring(0, 200) || '',
    type: lixPost.text?.length > 500 ? 'article' : 'post',
    link: `https://www.linkedin.com/feed/update/${lixPost.urn}`,
    date: new Date(lixPost.createdAt).toISOString().split('T')[0],
    likes: lixPost.numLikes || 0,
    comments: lixPost.numComments || 0
  };
}

async function updateLinkedInPosts() {
  console.log('🔄 Fetching LinkedIn posts from Lix API...\n');
  
  try {
    const posts = [];
    
    for (const [index, urn] of POST_URNS.entries()) {
      console.log(`📥 Fetching post ${index + 1}/${POST_URNS.length}: ${urn}`);
      
      try {
        const lixData = await fetchPostDetails(urn);
        const post = transformLixToOurFormat(lixData, index);
        posts.push(post);
        console.log(`✅ Success: ${post.title}`);
      } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Save to JSON file
    const jsonPath = path.join(process.cwd(), 'client/src/data/linkedin-posts.json');
    await fs.writeFile(jsonPath, JSON.stringify(posts, null, 2));
    
    console.log(`\n✨ Successfully updated ${posts.length} posts!`);
    console.log(`📝 File: client/src/data/linkedin-posts.json`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Check if API key is set
if (LIX_API_KEY === 'YOUR_API_KEY_HERE') {
  console.log('⚠️  Please set your Lix API key:');
  console.log('   1. Sign up at https://lix-it.com');
  console.log('   2. Get your API key');
  console.log('   3. Set environment variable: LIX_API_KEY=your_key');
  console.log('   4. Or edit this file and replace YOUR_API_KEY_HERE\n');
  console.log('💡 Alternatively, just manually update the JSON file - it\'s free!\n');
} else {
  updateLinkedInPosts();
}
