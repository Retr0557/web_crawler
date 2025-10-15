const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class WebCrawler {
  constructor(options = {}) {
    this.visitedUrls = new Set();
    this.maxDepth = options.maxDepth || 2;
    this.maxPages = options.maxPages || 50;
    this.sameDomain = options.sameDomain !== false; // Default to true
    this.delay = options.delay || 1000; // Delay between requests in ms
    this.timeout = options.timeout || 10000; // Request timeout in ms
    this.onPageCrawled = options.onPageCrawled || (() => {});
    this.onError = options.onError || ((url, error) => console.error(`Error crawling ${url}:`, error.message));
  }

  /**
   * Validates if a URL is valid and should be crawled
   */
  isValidUrl(urlString) {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  /**
   * Normalizes a URL by removing fragments and trailing slashes
   */
  normalizeUrl(urlString) {
    try {
      const url = new URL(urlString);
      // Remove fragment
      url.hash = '';
      // Remove trailing slash (except for root path)
      if (url.pathname !== '/' && url.pathname.endsWith('/')) {
        url.pathname = url.pathname.slice(0, -1);
      }
      // Convert root path with trailing slash to without
      if (url.pathname === '/' && url.search === '') {
        return url.toString().replace(/\/$/, '');
      }
      return url.toString();
    } catch (error) {
      return urlString;
    }
  }

  /**
   * Checks if a URL belongs to the same domain as the starting URL
   */
  isSameDomain(baseUrl, targetUrl) {
    try {
      const base = new URL(baseUrl);
      const target = new URL(targetUrl);
      return base.hostname === target.hostname;
    } catch (error) {
      return false;
    }
  }

  /**
   * Extracts all links from an HTML page
   */
  extractLinks(html, baseUrl) {
    const $ = cheerio.load(html);
    const links = [];

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (!href) return;

      try {
        // Convert relative URLs to absolute
        const absoluteUrl = new URL(href, baseUrl).toString();
        const normalizedUrl = this.normalizeUrl(absoluteUrl);

        if (this.isValidUrl(normalizedUrl)) {
          // Check same domain restriction
          if (!this.sameDomain || this.isSameDomain(baseUrl, normalizedUrl)) {
            links.push(normalizedUrl);
          }
        }
      } catch (error) {
        // Skip invalid URLs
      }
    });

    return [...new Set(links)]; // Remove duplicates
  }

  /**
   * Fetches the content of a URL
   */
  async fetchPage(url) {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebCrawler/1.0)',
        },
        maxRedirects: 5,
      });

      // Safely get the final URL after redirects
      const finalUrl = response.request?.res?.responseUrl || url;

      return {
        data: response.data,
        url: finalUrl,
        statusCode: response.status,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Pauses execution for the specified delay
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Crawls a single URL at a specific depth
   */
  async crawlUrl(url, depth = 0) {
    const normalizedUrl = this.normalizeUrl(url);

    // Check if we've already visited this URL
    if (this.visitedUrls.has(normalizedUrl)) {
      return [];
    }

    // Check if we've reached the maximum number of pages
    if (this.visitedUrls.size >= this.maxPages) {
      return [];
    }

    // Mark as visited
    this.visitedUrls.add(normalizedUrl);

    // Fetch the page
    try {
      const { data, url: finalUrl, statusCode } = await this.fetchPage(normalizedUrl);

      const links = this.extractLinks(data, finalUrl);

      // Call the callback with page data
      this.onPageCrawled({
        url: finalUrl,
        statusCode,
        depth,
        links: links.length,
        title: this.extractTitle(data),
        content: this.extractContent(data),
      });

      // If we haven't reached max depth, crawl the links
      if (depth < this.maxDepth) {
        return links;
      }

      return [];
    } catch (error) {
      this.onError(normalizedUrl, error);
      return [];
    }
  }

  /**
   * Extracts the title from HTML content
   */
  extractTitle(html) {
    try {
      const $ = cheerio.load(html);
      return $('title').text().trim() || 'No title';
    } catch (error) {
      return 'No title';
    }
  }

  /**
   * Extracts and parses the main text content from HTML
   */
  extractContent(html) {
    try {
      const $ = cheerio.load(html);
      
      // Remove script, style, and other non-content tags
      $('script, style, noscript, iframe, svg').remove();
      
      // Extract text from body, or fallback to entire document
      const bodyText = $('body').text() || $.text();
      
      // Clean up whitespace: replace multiple spaces/newlines with single space
      const cleanedText = bodyText
        .replace(/\s+/g, ' ')
        .trim();
      
      return cleanedText || 'No content';
    } catch (error) {
      return 'No content';
    }
  }

  /**
   * Starts crawling from a given URL
   */
  async crawl(startUrl) {
    if (!this.isValidUrl(startUrl)) {
      throw new Error(`Invalid URL: ${startUrl}`);
    }

    console.log(`Starting crawl from: ${startUrl}`);
    console.log(`Max depth: ${this.maxDepth}, Max pages: ${this.maxPages}`);
    console.log(`Same domain only: ${this.sameDomain}\n`);

    const queue = [{ url: startUrl, depth: 0 }];

    while (queue.length > 0 && this.visitedUrls.size < this.maxPages) {
      const { url, depth } = queue.shift();

      const links = await this.crawlUrl(url, depth);

      // Add new links to the queue
      for (const link of links) {
        if (!this.visitedUrls.has(this.normalizeUrl(link))) {
          queue.push({ url: link, depth: depth + 1 });
        }
      }

      // Add delay between requests to be respectful
      if (queue.length > 0) {
        await this.sleep(this.delay);
      }
    }

    console.log(`\nCrawl complete! Visited ${this.visitedUrls.size} pages.`);
    return Array.from(this.visitedUrls);
  }
}

module.exports = WebCrawler;
