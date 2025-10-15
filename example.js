const WebCrawler = require('./crawler');

// Example usage of the web crawler
async function main() {
  const startUrl = process.argv[2] || 'https://example.com';

  const crawler = new WebCrawler({
    maxDepth: 2,           // Maximum depth to crawl
    maxPages: 50,          // Maximum number of pages to crawl
    sameDomain: true,      // Only crawl pages on the same domain
    delay: 1000,           // Delay between requests (ms)
    timeout: 10000,        // Request timeout (ms)
    
    // Callback for each page crawled
    onPageCrawled: (pageData) => {
      console.log(`✓ Crawled [Depth ${pageData.depth}]: ${pageData.url}`);
      console.log(`  Status: ${pageData.statusCode}, Links: ${pageData.links}, Title: ${pageData.title}`);
    },
    
    // Callback for errors
    onError: (url, error) => {
      console.error(`✗ Error crawling ${url}: ${error.message}`);
    }
  });

  try {
    const visitedUrls = await crawler.crawl(startUrl);
    
    console.log('\n=== Crawl Summary ===');
    console.log(`Total pages visited: ${visitedUrls.length}`);
    console.log('\nVisited URLs:');
    visitedUrls.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });
  } catch (error) {
    console.error('Crawl failed:', error.message);
    process.exit(1);
  }
}

main();
