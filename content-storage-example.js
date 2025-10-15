const WebCrawler = require('./crawler');
const fs = require('fs');
const path = require('path');

/**
 * Example demonstrating how to store parsed content from crawled pages
 */

// Create a directory for storing crawled content
const STORAGE_DIR = path.join(__dirname, 'crawled_content');

function ensureStorageDirectory() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log(`Created storage directory: ${STORAGE_DIR}\n`);
  }
}

// Helper function to create a safe filename from a URL
function urlToFilename(url) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 100) + '.txt';
}

// Example 1: Store content as text files
async function storeContentAsTextFiles() {
  console.log('=== Example 1: Store Content as Text Files ===\n');
  
  ensureStorageDirectory();
  
  const crawler = new WebCrawler({
    maxDepth: 2,
    maxPages: 10,
    sameDomain: true,
    delay: 1000,
    
    onPageCrawled: (pageData) => {
      console.log(`✓ Crawled: ${pageData.url}`);
      console.log(`  Title: ${pageData.title}`);
      console.log(`  Content length: ${pageData.content.length} characters\n`);
      
      // Store content to a text file
      const filename = urlToFilename(pageData.url);
      const filepath = path.join(STORAGE_DIR, filename);
      
      const fileContent = `URL: ${pageData.url}
Title: ${pageData.title}
Status Code: ${pageData.statusCode}
Depth: ${pageData.depth}
Links Found: ${pageData.links}
Crawled At: ${new Date().toISOString()}

Content:
${pageData.content}
`;
      
      fs.writeFileSync(filepath, fileContent, 'utf8');
      console.log(`  ✓ Saved to: ${filename}\n`);
    },
    
    onError: (url, error) => {
      console.error(`✗ Error crawling ${url}: ${error.message}`);
    }
  });
  
  try {
    const startUrl = process.argv[2] || 'https://example.com';
    await crawler.crawl(startUrl);
    
    console.log('\n=== Crawl Complete ===');
    console.log(`Content stored in: ${STORAGE_DIR}`);
  } catch (error) {
    console.error('Crawl failed:', error.message);
  }
}

// Example 2: Store content as JSON
async function storeContentAsJson() {
  console.log('=== Example 2: Store Content as JSON ===\n');
  
  ensureStorageDirectory();
  
  const pageDataArray = [];
  
  const crawler = new WebCrawler({
    maxDepth: 1,
    maxPages: 5,
    sameDomain: true,
    delay: 1000,
    
    onPageCrawled: (pageData) => {
      console.log(`✓ Crawled: ${pageData.url}`);
      
      // Collect all page data
      pageDataArray.push({
        url: pageData.url,
        title: pageData.title,
        statusCode: pageData.statusCode,
        depth: pageData.depth,
        linksCount: pageData.links,
        contentLength: pageData.content.length,
        content: pageData.content,
        crawledAt: new Date().toISOString()
      });
    }
  });
  
  try {
    const startUrl = process.argv[2] || 'https://example.com';
    await crawler.crawl(startUrl);
    
    // Save all data as JSON
    const jsonFilepath = path.join(STORAGE_DIR, 'crawl_data.json');
    fs.writeFileSync(jsonFilepath, JSON.stringify(pageDataArray, null, 2), 'utf8');
    
    console.log('\n=== Crawl Complete ===');
    console.log(`Stored ${pageDataArray.length} pages`);
    console.log(`JSON data saved to: ${jsonFilepath}`);
  } catch (error) {
    console.error('Crawl failed:', error.message);
  }
}

// Example 3: Store content summary (without full content)
async function storeContentSummary() {
  console.log('=== Example 3: Store Content Summary ===\n');
  
  ensureStorageDirectory();
  
  const summaryData = [];
  
  const crawler = new WebCrawler({
    maxDepth: 2,
    maxPages: 15,
    sameDomain: true,
    delay: 500,
    
    onPageCrawled: (pageData) => {
      console.log(`✓ Crawled: ${pageData.url}`);
      
      // Store summary with content preview (first 200 characters)
      summaryData.push({
        url: pageData.url,
        title: pageData.title,
        statusCode: pageData.statusCode,
        depth: pageData.depth,
        linksCount: pageData.links,
        contentLength: pageData.content.length,
        contentPreview: pageData.content.length > 200 
          ? pageData.content.substring(0, 200) + '...'
          : pageData.content,
        crawledAt: new Date().toISOString()
      });
    }
  });
  
  try {
    const startUrl = process.argv[2] || 'https://example.com';
    await crawler.crawl(startUrl);
    
    // Save summary as JSON
    const summaryFilepath = path.join(STORAGE_DIR, 'crawl_summary.json');
    fs.writeFileSync(summaryFilepath, JSON.stringify(summaryData, null, 2), 'utf8');
    
    console.log('\n=== Crawl Complete ===');
    console.log(`Summary saved to: ${summaryFilepath}`);
  } catch (error) {
    console.error('Crawl failed:', error.message);
  }
}

// Main function to run examples
async function main() {
  const example = process.argv[3] || '1';
  
  console.log('Content Storage Examples');
  console.log('========================\n');
  
  switch (example) {
    case '1':
      await storeContentAsTextFiles();
      break;
    case '2':
      await storeContentAsJson();
      break;
    case '3':
      await storeContentSummary();
      break;
    default:
      console.log('Usage: node content-storage-example.js [URL] [example_number]');
      console.log('Examples:');
      console.log('  1 - Store content as text files');
      console.log('  2 - Store content as JSON');
      console.log('  3 - Store content summary');
      console.log('\nExample: node content-storage-example.js https://example.com 1');
  }
}

main().catch(console.error);
