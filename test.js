const WebCrawler = require('./crawler');

// Unit tests for the WebCrawler class
function testUrlValidation() {
  console.log('Testing URL validation...');
  const crawler = new WebCrawler();
  
  const validUrls = [
    'https://example.com',
    'http://example.com/path',
    'https://subdomain.example.com/path?query=value'
  ];
  
  const invalidUrls = [
    'not-a-url',
    'ftp://example.com',
    'javascript:alert(1)',
    ''
  ];
  
  let hasError = false;
  
  validUrls.forEach(url => {
    if (!crawler.isValidUrl(url)) {
      console.error(`❌ Expected ${url} to be valid`);
      hasError = true;
    }
  });
  
  invalidUrls.forEach(url => {
    if (crawler.isValidUrl(url)) {
      console.error(`❌ Expected ${url} to be invalid`);
      hasError = true;
    }
  });
  
  if (hasError) {
    return false;
  }
  
  console.log('✅ URL validation tests passed');
  return true;
}

function testUrlNormalization() {
  console.log('\nTesting URL normalization...');
  const crawler = new WebCrawler();
  
  const tests = [
    { input: 'https://example.com/', expected: 'https://example.com' },
    { input: 'https://example.com/path/', expected: 'https://example.com/path' },
    { input: 'https://example.com/path#fragment', expected: 'https://example.com/path' },
    { input: 'https://example.com/path/?query=1#fragment', expected: 'https://example.com/path?query=1' }
  ];
  
  let hasError = false;
  
  tests.forEach(test => {
    const result = crawler.normalizeUrl(test.input);
    if (result !== test.expected) {
      console.error(`❌ normalizeUrl(${test.input}) = ${result}, expected ${test.expected}`);
      hasError = true;
    }
  });
  
  if (hasError) {
    return false;
  }
  
  console.log('✅ URL normalization tests passed');
  return true;
}

function testSameDomain() {
  console.log('\nTesting same domain check...');
  const crawler = new WebCrawler();
  
  const tests = [
    { base: 'https://example.com', target: 'https://example.com/path', expected: true },
    { base: 'https://example.com', target: 'https://other.com', expected: false },
    { base: 'https://sub.example.com', target: 'https://example.com', expected: false },
    { base: 'http://example.com', target: 'https://example.com', expected: true }
  ];
  
  let hasError = false;
  
  tests.forEach(test => {
    const result = crawler.isSameDomain(test.base, test.target);
    if (result !== test.expected) {
      console.error(`❌ isSameDomain(${test.base}, ${test.target}) = ${result}, expected ${test.expected}`);
      hasError = true;
    }
  });
  
  if (hasError) {
    return false;
  }
  
  console.log('✅ Same domain tests passed');
  return true;
}

function testLinkExtraction() {
  console.log('\nTesting link extraction...');
  const crawler = new WebCrawler();
  
  const html = `
    <html>
      <body>
        <a href="/relative">Relative</a>
        <a href="https://example.com/absolute">Absolute</a>
        <a href="https://other.com/external">External</a>
        <a href="/duplicate">Duplicate 1</a>
        <a href="/duplicate">Duplicate 2</a>
        <a href="#fragment">Fragment</a>
      </body>
    </html>
  `;
  
  const links = crawler.extractLinks(html, 'https://example.com');
  
  if (!links.includes('https://example.com/relative')) {
    console.error('❌ Missing relative link conversion');
    return false;
  }
  
  if (!links.includes('https://example.com/absolute')) {
    console.error('❌ Missing absolute link');
    return false;
  }
  
  // Check that duplicates are removed
  const duplicateCount = links.filter(l => l.includes('duplicate')).length;
  if (duplicateCount !== 1) {
    console.error(`❌ Expected 1 duplicate link, got ${duplicateCount}`);
    return false;
  }
  
  console.log('✅ Link extraction tests passed');
  return true;
}

function testTitleExtraction() {
  console.log('\nTesting title extraction...');
  const crawler = new WebCrawler();
  
  const htmlWithTitle = '<html><head><title>Test Page</title></head><body></body></html>';
  const htmlWithoutTitle = '<html><body></body></html>';
  
  const title1 = crawler.extractTitle(htmlWithTitle);
  const title2 = crawler.extractTitle(htmlWithoutTitle);
  
  if (title1 !== 'Test Page') {
    console.error(`❌ Expected "Test Page", got "${title1}"`);
    return false;
  }
  
  if (title2 !== 'No title') {
    console.error(`❌ Expected "No title", got "${title2}"`);
    return false;
  }
  
  console.log('✅ Title extraction tests passed');
  return true;
}

function testContentExtraction() {
  console.log('\nTesting content extraction...');
  const crawler = new WebCrawler();
  
  const htmlWithContent = `
    <html>
      <head>
        <title>Test Page</title>
        <script>console.log('should be removed');</script>
        <style>body { color: red; }</style>
      </head>
      <body>
        <h1>Main Heading</h1>
        <p>This is a paragraph with some text.</p>
        <p>Another paragraph here.</p>
        <script>alert('ignore this');</script>
      </body>
    </html>
  `;
  
  const htmlWithoutContent = '<html><head></head><body></body></html>';
  
  const content1 = crawler.extractContent(htmlWithContent);
  const content2 = crawler.extractContent(htmlWithoutContent);
  
  // Check that content is extracted
  if (!content1.includes('Main Heading')) {
    console.error(`❌ Expected content to include "Main Heading", got "${content1}"`);
    return false;
  }
  
  if (!content1.includes('This is a paragraph')) {
    console.error(`❌ Expected content to include paragraph text`);
    return false;
  }
  
  // Check that scripts and styles are removed
  if (content1.includes('console.log') || content1.includes('alert')) {
    console.error(`❌ Content should not include script text`);
    return false;
  }
  
  if (content1.includes('color: red')) {
    console.error(`❌ Content should not include style text`);
    return false;
  }
  
  // Check empty content
  if (content2 !== 'No content') {
    console.error(`❌ Expected "No content" for empty HTML, got "${content2}"`);
    return false;
  }
  
  console.log('✅ Content extraction tests passed');
  return true;
}

function testCrawlerConfiguration() {
  console.log('\nTesting crawler configuration...');
  
  const defaultCrawler = new WebCrawler();
  if (defaultCrawler.maxDepth !== 2) {
    console.error(`❌ Expected default maxDepth 2, got ${defaultCrawler.maxDepth}`);
    return false;
  }
  if (defaultCrawler.maxPages !== 50) {
    console.error(`❌ Expected default maxPages 50, got ${defaultCrawler.maxPages}`);
    return false;
  }
  
  const customCrawler = new WebCrawler({ maxDepth: 5, maxPages: 100 });
  if (customCrawler.maxDepth !== 5) {
    console.error(`❌ Expected custom maxDepth 5, got ${customCrawler.maxDepth}`);
    return false;
  }
  if (customCrawler.maxPages !== 100) {
    console.error(`❌ Expected custom maxPages 100, got ${customCrawler.maxPages}`);
    return false;
  }
  
  console.log('✅ Crawler configuration tests passed');
  return true;
}

// Run all tests
async function runTests() {
  console.log('=== Running Web Crawler Tests ===\n');
  
  const tests = [
    testUrlValidation,
    testUrlNormalization,
    testSameDomain,
    testLinkExtraction,
    testTitleExtraction,
    testContentExtraction,
    testCrawlerConfiguration
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      if (test()) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Test error:`, error.message);
      failed++;
    }
  }
  
  console.log('\n=== Test Summary ===');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total: ${tests.length}`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
