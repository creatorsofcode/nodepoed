const SCRAPER_API_KEY = '18ab58b0d0b512941eaf40ceb2d66ac5';

async function searchBeboScraperAPI(query) {
    try {
        const targetUrl = `https://bebo.ee/search?query=${encodeURIComponent(query)}`;
        const url = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}&country_code=ee`;
        console.log(`🔍 Otsin Bebot ScraperAPI-ga: ${query}`);

        const response = await axios.get(url, {
            timeout: 20000
        });

        if (response.data && response.data.length > 1000) {
            return parseBeboHtml(response.data);
        }
        return [];
    } catch (error) {
        console.log(`❌ ScraperAPI Bebo viga: ${error.message}`);
        return [];
    }
}