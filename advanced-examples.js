const WebCrawler = require('./crawler');

/**
 * Advanced examples demonstrating various crawler configurations
 */

// Example 1: Basic crawler with minimal configuration
async function basicExample() {
  console.log('=== Example 1: Basic Crawler ===\n');
  
  const crawler = new WebCrawler({
    maxDepth: 1,
    maxPages: 5
  });
  
  try {
    const urls = await crawler.crawl('https://example.com');
    console.log(`\nCrawled ${urls.length} pages\n`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 2: Deep crawl with custom callbacks
async function deepCrawlExample() {
  console.log('=== Example 2: Deep Crawl with Callbacks ===\n');
  
  const crawledPages = [];
  const errors = [];
  
  const crawler = new WebCrawler({
    maxDepth: 3,
    maxPages: 20,
    sameDomain: true,
    delay: 500,
    
    onPageCrawled: (pageData) => {
      crawledPages.push(pageData);
      console.log(`[Depth ${pageData.depth}] ${pageData.title} - ${pageData.url}`);
    },
    
    onError: (url, error) => {
      errors.push({ url, error: error.message });
      console.error(`Failed: ${url}`);
    }
  });
  
  try {
    await crawler.crawl('https://example.com');
    
    console.log(`\n--- Summary ---`);
    console.log(`Successfully crawled: ${crawledPages.length}`);
    console.log(`Errors encountered: ${errors.length}`);
  } catch (error) {
    console.error('Crawl error:', error.message);
  }
}

// Example 3: Cross-domain crawling
async function crossDomainExample() {
  console.log('=== Example 3: Cross-Domain Crawl ===\n');
  
  const domains = new Set();
  
  const crawler = new WebCrawler({
    maxDepth: 2,
    maxPages: 10,
    sameDomain: false,  // Allow cross-domain crawling
    delay: 1000,
    
    onPageCrawled: (pageData) => {
      const url = new URL(pageData.url);
      domains.add(url.hostname);
      console.log(`[${url.hostname}] ${pageData.title}`);
    }
  });
  
  try {
    await crawler.crawl('https://example.com');
    
    console.log(`\n--- Domains Visited ---`);
    domains.forEach(domain => console.log(`- ${domain}`));
  } catch (error) {
    console.error('Crawl error:', error.message);
  }
}

// Example 4: Collecting data from pages
async function dataCollectionExample() {
  console.log('=== Example 4: Data Collection ===\n');
  
  const pageData = [];
  
  const crawler = new WebCrawler({
    maxDepth: 2,
    maxPages: 15,
    
    onPageCrawled: (data) => {
      pageData.push({
        url: data.url,
        title: data.title,
        depth: data.depth,
        linksCount: data.links,
        statusCode: data.statusCode,
        contentLength: data.content.length,
        contentPreview: data.content.length > 100 
          ? data.content.substring(0, 100) + '...'
          : data.content
      });
    }
  });
  
  try {
    await crawler.crawl('https://example.com');
    
    console.log('\n--- Collected Data ---');
    console.log(JSON.stringify(pageData, null, 2));
  } catch (error) {
    console.error('Crawl error:', error.message);
  }
}

// Example 5: Using crawler methods programmatically
function programmaticExample() {
  console.log('=== Example 5: Programmatic Usage ===\n');
  
  const crawler = new WebCrawler();
  
  // Test URL validation
  const urlsToTest = [
    'https://example.com',
    'http://test.com/path',
    'ftp://invalid.com',
    'not-a-url'
  ];
  
  console.log('URL Validation:');
  urlsToTest.forEach(url => {
    const isValid = crawler.isValidUrl(url);
    console.log(`  ${url}: ${isValid ? '✓ Valid' : '✗ Invalid'}`);
  });
  
  // Test URL normalization
  const urlsToNormalize = [
    'https://example.com/',
    'https://example.com/path/',
    'https://example.com/page#section',
    'https://example.com/page?q=1#top'
  ];
  
  console.log('\nURL Normalization:');
  urlsToNormalize.forEach(url => {
    const normalized = crawler.normalizeUrl(url);
    console.log(`  ${url}`);
    console.log(`  → ${normalized}`);
  });
  
  // Test domain checking
  console.log('\nSame Domain Check:');
  console.log(`  example.com vs example.com/page: ${crawler.isSameDomain('https://example.com', 'https://example.com/page')}`);
  console.log(`  example.com vs other.com: ${crawler.isSameDomain('https://example.com', 'https://other.com')}`);
  console.log(`  sub.example.com vs example.com: ${crawler.isSameDomain('https://sub.example.com', 'https://example.com')}`);
}

// Run examples
async function main() {
  const example = process.argv[2] || 'all';
  
  if (example === 'all' || example === '5') {
    programmaticExample();
  }
  
  // Note: Other examples require network access
  // Uncomment to run them with real websites
  /*
  if (example === 'all' || example === '1') {
    await basicExample();
  }
  
  if (example === 'all' || example === '2') {
    await deepCrawlExample();
  }
  
  if (example === 'all' || example === '3') {
    await crossDomainExample();
  }
  
  if (example === 'all' || example === '4') {
    await dataCollectionExample();
  }
  */
  
  console.log('\n=== Examples Complete ===');
  console.log('Run with: node advanced-examples.js [1|2|3|4|5|all]');
  console.log('Note: Examples 1-4 require network access');
}

main().catch(console.error);
