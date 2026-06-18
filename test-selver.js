const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPER_API_KEY = '18ab58b0d0b512941eaf40ceb2d66ac5';

async function testSelverClass() {
    try {
        const url = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=https://www.selver.ee/search?q=sai&country_code=ee`;
        console.log('🔍 Testin Selverit...');

        const response = await axios.get(url, { timeout: 20000 });
        const $ = cheerio.load(response.data);

        // Otsi ProductCard__title klassi
        const titles = $('.ProductCard__title');
        console.log(`📦 Leitud ${titles.length} toodet klassiga ProductCard__title`);

        titles.each((i, el) => {
            const name = $(el).text().trim();
            console.log(`  ${i+1}. ${name}`);
        });

        if (titles.length === 0) {
            // Salvesta HTML, et näha, mis seal on
            const fs = require('fs');
            fs.writeFileSync('selver-debug.html', response.data);
            console.log('📄 Vastus salvestatud selver-debug.html');
        }
    } catch (error) {
        console.log('❌ Viga:', error.message);
    }
}

testSelverClass();