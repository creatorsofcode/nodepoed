const { chromium } = require('playwright');
const cheerio = require('cheerio');
const fs = require('fs');

async function testBeboPlaywright() {
    let browser = null;
    let context = null;
    let page = null;
    try {
        console.log('🔍 Testin Bebot Playwrightiga...');
        browser = await chromium.launch({ headless: false }); // headless: false, et näha
        context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            locale: 'et-EE'
        });
        page = await context.newPage();

        await page.goto('https://bebo.ee/search?query=sai', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(5000); // oota 5 sekundit

        // Keri alla
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(2000);

        const html = await page.content();
        fs.writeFileSync('bebo-playwright-debug.html', html);
        console.log('📄 HTML salvestatud bebo-playwright-debug.html');

        // Proovi leida tooteid
        const $ = cheerio.load(html);
        const items = $('.product-card, .product-item, .search-result-item, [data-product-id]');
        console.log(`📦 Leitud ${items.length} tootekaarti`);

        items.each((i, el) => {
            if (i >= 5) return false;
            const name = $(el).find('.product-name, .name, .title').first().text().trim();
            const price = $(el).find('.price, .product-price').first().text().trim();
            console.log(`  ${i+1}. ${name} - ${price}`);
        });

        await browser.close();
    } catch (error) {
        console.log('❌ Viga:', error.message);
        if (browser) await browser.close().catch(() => {});
    }
}

testBeboPlaywright();