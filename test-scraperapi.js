const axios = require('axios');

const API_KEY = '18ab58b0d0b512941eaf40ceb2d66ac5';

async function testScraperAPI() {
    try {
        const url = `https://api.scraperapi.com/?api_key=${API_KEY}&url=https://httpbin.org/ip`;
        console.log('🔍 Testin ScraperAPI-d...');
        
        const response = await axios.get(url, {
            timeout: 30000
        });
        
        console.log('✅ ScraperAPI töötab!');
        console.log('📦 Vastus:', response.data);
        return true;
    } catch (error) {
        console.log('❌ ScraperAPI viga:', error.message);
        return false;
    }
}

testScraperAPI();