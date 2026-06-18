const axios = require('axios');
const cheerio = require('cheerio');

const ZENROWS_API_KEY = 'be40eedf6b67af846ae836320a8a0c161001e265';

async function testBebo() {
    try {
        const targetUrl = 'https://bebo.ee/search?query=sai';
        console.log('🔍 Testin Bebot ZenRowsiga...');

        const response = await axios({
            url: 'https://api.zenrows.com/v1/',
            method: 'GET',
            params: {
                url: targetUrl,
                apikey: ZENROWS_API_KEY,
                js_render: 'true',
                wait_for: '.product-card',
                wait: '5000',
                premium_proxy: 'false',
                country: 'ee'
            },
            timeout: 30000
        });

        console.log(`📄 Vastuse pikkus: ${response.data.length}`);
        
        // Salvesta HTML analüüsiks
        const fs = require('fs');
        fs.writeFileSync('bebo-response.html', response.data);
        console.log('📄 Vastus salvestatud bebo-response.html');

        // Proovi leida tooteid
        const $ = cheerio.load(response.data);
        const items = $('.product-card, .product-item, .search-result-item, [data-product-id]');
        console.log(`📦 Leitud ${items.length} tootekaarti`);

        items.each((i, el) => {
            if (i >= 5) return false;
            const name = $(el).find('.product-name, .name, .title').first().text().trim();
            const price = $(el).find('.price, .product-price').first().text().trim();
            console.log(`  ${i+1}. ${name} - ${price}`);
        });

    } catch (error) {
        console.log('❌ Viga:', error.message);
    }
}

testBebo();