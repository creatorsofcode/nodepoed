const { chromium } = require('playwright');
const cheerio = require('cheerio');
const fs = require('fs');

async function debugToiduhind() {
    let browser = null;
    let page = null;
    try {
        console.log('🔍 Käivitan Playwrighti...');
        browser = await chromium.launch({
            headless: false, // näeme brauserit
            args: ['--no-sandbox']
        });
        page = await browser.newPage();

        console.log('🔍 Lähen Toiduhind.ee lehele...');
        await page.goto('https://toiduhind.ee/search?q=sai', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('⏳ Ootan 5 sekundit...');
        await page.waitForTimeout(5000);

        console.log('📜 Kerin alla...');
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(2000);

        console.log('📄 Võtan HTML-i...');
        const html = await page.content();

        // Salvesta HTML
        fs.writeFileSync('toiduhind-full.html', html);
        console.log('✅ HTML salvestatud: toiduhind-full.html');

        // Proovi leida kõik elemendid, mis sisaldavad "€" märki
        const $ = cheerio.load(html);
        const priceElements = $('*:contains("€")');
        console.log(`💰 Leitud ${priceElements.length} elementi, mis sisaldavad € märki`);

        // Kuva esimesed 5
        priceElements.each((i, el) => {
            if (i >= 5) return false;
            const text = $(el).text().trim();
            console.log(`  ${i+1}. ${text.substring(0, 100)}`);
        });

        // Proovi leida kõik lingid, mis viitavad tootele
        const productLinks = $('a[href*="/product/"]');
        console.log(`🔗 Leitud ${productLinks.length} linki toodetele`);

        if (productLinks.length === 0) {
            console.log('⚠️ Ühtegi tootelinki ei leitud. Võib-olla on teine struktuur.');
            console.log('📄 Ava fail toiduhind-full.html ja otsi käsitsi.');
        }

        await browser.close();
        console.log('✅ Diagnostika lõpetatud!');
    } catch (error) {
        console.log('❌ Viga:', error.message);
        if (browser) await browser.close().catch(() => {});
    }
}

debugToiduhind();