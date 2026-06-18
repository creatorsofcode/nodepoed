const puppeteer = require('puppeteer');

async function searchSelverPuppeteer(query) {
    let browser = null;
    try {
        console.log(`🔍 Otsin Selverist Puppeteeriga: ${query}`);
        
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
        
        await page.goto(`https://www.selver.ee/search?q=${encodeURIComponent(query)}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // Oota, et tooted ilmuvad
        await page.waitForSelector('.product-item, .product-tile, [data-product-id]', { timeout: 10000 }).catch(() => {});
        
        const html = await page.content();
        await browser.close();
        
        return parseSelverHtml(html);
        
    } catch (error) {
        if (browser) await browser.close().catch(() => {});
        console.log(`❌ Puppeteer viga: ${error.message}`);
        return [];
    }
}