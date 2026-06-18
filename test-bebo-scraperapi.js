const axios = require('axios');

const SCRAPER_API_KEY = '18ab58b0d0b512941eaf40ceb2d66ac5';

async function testBeboScraperAPI() {
    try {
        const targetUrl = 'https://bebo.ee/search?query=sai';
        const url = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}&country_code=ee&render=true&wait_for=.product-card&wait=5000`;
        console.log('🔍 Testin Bebot ScraperAPI-ga...');

        const response = await axios.get(url, {
            timeout: 30000
        });

        console.log(`✅ Vastus: ${response.status} – pikkus: ${response.data.length}`);
        console.log(`📄 Esimene 500 tähemärki:\n${response.data.substring(0, 500)}`);

        // Salvesta vastus
        const fs = require('fs');
        fs.writeFileSync('bebo-scraperapi.html', response.data);
        console.log('📄 Vastus salvestatud bebo-scraperapi.html');
    } catch (error) {
        console.log('❌ Viga:', error.message);
        if (error.response) {
            console.log('📄 Vastuse staatus:', error.response.status);
        }
    }
}

testBeboScraperAPI();