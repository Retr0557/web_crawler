# Web Crawler

A simple and efficient web crawler built with Node.js that can crawl websites and extract links from web pages.

## Features

- 🔍 **Depth-limited crawling** - Control how deep the crawler goes
- 🎯 **Domain restriction** - Optionally limit crawling to the same domain
- 📊 **Link extraction** - Automatically extract and follow links
- 📝 **Content parsing** - Extract and parse text content from web pages
- ⏱️ **Rate limiting** - Built-in delay between requests to be respectful
- 🛡️ **URL validation** - Validates and normalizes URLs
- 📈 **Progress tracking** - Callbacks for monitoring crawl progress
- 🚫 **Duplicate prevention** - Tracks visited URLs to avoid duplicates
- 💾 **Content storage** - Store parsed content to files or databases

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Retr0557/web_crawler.git
cd web_crawler
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Basic Usage

Run the example script with a URL:

```bash
node example.js https://example.com
```

Or use the npm start command:

```bash
npm start https://example.com
```

### Programmatic Usage

```javascript
const WebCrawler = require('./crawler');

const crawler = new WebCrawler({
  maxDepth: 2,           // Maximum depth to crawl
  maxPages: 50,          // Maximum number of pages to crawl
  sameDomain: true,      // Only crawl pages on the same domain
  delay: 1000,           // Delay between requests (ms)
  timeout: 10000,        // Request timeout (ms)
  
  // Callback for each page crawled
  onPageCrawled: (pageData) => {
    console.log(`Crawled: ${pageData.url}`);
    console.log(`Status: ${pageData.statusCode}`);
    console.log(`Links found: ${pageData.links}`);
    console.log(`Title: ${pageData.title}`);
    console.log(`Content: ${pageData.content.substring(0, 100)}...`);
  },
  
  // Callback for errors
  onError: (url, error) => {
    console.error(`Error crawling ${url}:`, error.message);
  }
});

// Start crawling
crawler.crawl('https://example.com')
  .then(visitedUrls => {
    console.log(`Crawl complete! Visited ${visitedUrls.length} pages.`);
  })
  .catch(error => {
    console.error('Crawl failed:', error);
  });
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxDepth` | Number | 2 | Maximum depth to crawl from the starting URL |
| `maxPages` | Number | 50 | Maximum number of pages to crawl |
| `sameDomain` | Boolean | true | Only crawl pages on the same domain as the starting URL |
| `delay` | Number | 1000 | Delay between requests in milliseconds |
| `timeout` | Number | 10000 | Request timeout in milliseconds |
| `onPageCrawled` | Function | null | Callback function called after each page is crawled |
| `onError` | Function | null | Callback function called when an error occurs |

## Page Data Structure

When a page is crawled, the `onPageCrawled` callback receives a `pageData` object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `url` | String | The final URL of the page (after redirects) |
| `statusCode` | Number | HTTP status code of the response |
| `depth` | Number | Crawl depth of this page from the starting URL |
| `links` | Number | Number of links found on the page |
| `title` | String | Page title extracted from `<title>` tag |
| `content` | String | Parsed text content from the page (with scripts/styles removed) |

## API Reference

### `WebCrawler`

Main crawler class.

#### Constructor

```javascript
new WebCrawler(options)
```

Creates a new web crawler instance with the specified options.

#### Methods

##### `crawl(startUrl)`

Starts crawling from the specified URL.

- **Parameters:**
  - `startUrl` (String): The URL to start crawling from
- **Returns:** Promise<Array<String>> - Array of visited URLs

##### `isValidUrl(urlString)`

Validates if a URL is valid.

- **Parameters:**
  - `urlString` (String): The URL to validate
- **Returns:** Boolean

##### `normalizeUrl(urlString)`

Normalizes a URL by removing fragments and trailing slashes.

- **Parameters:**
  - `urlString` (String): The URL to normalize
- **Returns:** String

##### `extractTitle(html)`

Extracts the title from HTML content.

- **Parameters:**
  - `html` (String): HTML content as a string
- **Returns:** String - The page title or 'No title' if not found

##### `extractContent(html)`

Extracts and parses the main text content from HTML, removing scripts, styles, and other non-content elements.

- **Parameters:**
  - `html` (String): HTML content as a string
- **Returns:** String - The cleaned text content or 'No content' if empty

## Examples

### Crawl with custom depth

```javascript
const crawler = new WebCrawler({ maxDepth: 3 });
await crawler.crawl('https://example.com');
```

### Crawl without domain restriction

```javascript
const crawler = new WebCrawler({ sameDomain: false, maxPages: 100 });
await crawler.crawl('https://example.com');
```

### Custom callbacks

```javascript
const crawler = new WebCrawler({
  onPageCrawled: (pageData) => {
    // Save to database or process data
    console.log(`${pageData.url} - ${pageData.title}`);
    console.log(`Content length: ${pageData.content.length}`);
  },
  onError: (url, error) => {
    // Log errors to file
    console.error(`Failed to crawl ${url}`);
  }
});
```

### Store content to files

```javascript
const fs = require('fs');
const crawler = new WebCrawler({
  onPageCrawled: (pageData) => {
    const filename = pageData.url.replace(/[^a-z0-9]/gi, '_') + '.txt';
    fs.writeFileSync(filename, pageData.content);
    console.log(`Saved: ${filename}`);
  }
});
await crawler.crawl('https://example.com');
```

For more examples on storing content, see [content-storage-example.js](./content-storage-example.js).

## Dependencies

- [axios](https://www.npmjs.com/package/axios) - HTTP client for making requests
- [cheerio](https://www.npmjs.com/package/cheerio) - Fast, flexible HTML parser

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
