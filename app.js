const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
<<<<<<< HEAD
const puppeteer = require('puppeteer');
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa

const app = express();
const PORT = process.env.PORT || 10000;

<<<<<<< HEAD
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
=======
app.use(cors());
app.use(express.json());
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa

// ----------------------------
// HEADERS
// ----------------------------
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'et-EE,et;q=0.9,en;q=0.8',
<<<<<<< HEAD
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
};

// ----------------------------
// PROXY LIST
// ----------------------------
function getProxyList() {
    return [
        'http://37.49.224.15:3128',
        'http://5.45.126.128:8080',
        'http://85.192.61.93:7443',
        'http://91.107.182.124:82',
        'http://138.124.114.42:7443',
        'http://89.169.53.40:7443',
        'http://213.165.42.185:7443',
        'http://79.137.205.130:7443',
        'http://64.188.77.26:3128',
        'http://88.210.21.224:1080',
        'http://207.246.234.115:4669',
        'http://209.141.46.220:9091',
        'http://174.138.119.88:80',
        'http://92.119.56.37:5555',
        'http://217.174.244.117:3129',
        'http://62.60.149.161:3128',
    ];
}

async function requestWithProxy(url, headers = HEADERS, timeout = 15000) {
    const proxies = getProxyList();
<<<<<<< HEAD
    // Sega proxyd
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
    const shuffled = proxies.sort(() => Math.random() - 0.5);
    
    for (const proxy of shuffled) {
        try {
<<<<<<< HEAD
            const response = await axios.get(url, {
                headers: headers,
                proxy: {
                    host: proxy.split('://')[1].split(':')[0],
                    port: parseInt(proxy.split(':')[2]),
                    protocol: 'http'
=======
            const proxyUrl = new URL(proxy);
            const response = await axios.get(url, {
                headers: headers,
                proxy: {
                    host: proxyUrl.hostname,
                    port: parseInt(proxyUrl.port),
                    protocol: proxyUrl.protocol.replace(':', '')
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
                },
                timeout: timeout,
                validateStatus: (status) => status === 200
            });
            
            if (response.data && response.data.length > 5000) {
                console.log(`✅ Proxy töötab: ${proxy}`);
                return response;
            }
        } catch (error) {
            console.log(`❌ Proxy ei tööta: ${proxy}`);
            continue;
        }
    }
    
<<<<<<< HEAD
    // Proovi ilma proxyta
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
    try {
        const response = await axios.get(url, {
            headers: headers,
            timeout: timeout
        });
        if (response.data && response.data.length > 5000) {
            return response;
        }
    } catch (error) {
        console.log('❌ Ilma proxyta ei tööta');
    }
    
    return null;
}

// ----------------------------
// COOP (TÖÖTAB ALATI)
// ----------------------------
async function searchCoop(query) {
    try {
        const url = 'https://coophaapsalu.ee/wp-json/wc/store/v1/products';
        const response = await axios.get(url, {
            params: { search: query, per_page: 20 },
            timeout: 15000
        });
        
        if (response.status !== 200 || !Array.isArray(response.data)) {
            return [];
        }
        
        const products = [];
        for (const item of response.data.slice(0, 20)) {
            try {
                const name = item.name || '';
                if (!name) continue;
                
                const prices = item.prices || {};
                const rawPrice = prices.price;
                const minorUnit = prices.currency_minor_unit || 2;
                
                let priceEur = null;
                if (rawPrice !== undefined && rawPrice !== null) {
                    priceEur = parseInt(rawPrice) / Math.pow(10, minorUnit);
                }
                
                products.push({
                    name: name.slice(0, 200),
                    price_eur: priceEur,
                    url: item.permalink || '',
                    store: 'Coop'
                });
            } catch (error) {
                continue;
            }
        }
        
        console.log(`✅ Coop: ${products.length} toodet`);
        return products;
    } catch (error) {
        console.log(`❌ Coop viga: ${error.message}`);
        return [];
    }
}

// ----------------------------
<<<<<<< HEAD
// SELVER PUPPETEERIGA (RENDERDAB JAVASCRIPTI)
// ----------------------------
async function searchSelverPuppeteer(query) {
    let browser = null;
    try {
        console.log(`🔍 Otsin Selverist (Puppeteer): ${query}`);
        
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });
        
        const page = await browser.newPage();
        await page.setUserAgent(HEADERS['User-Agent']);
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'et-EE,et;q=0.9,en;q=0.8'
        });
        
        const url = `https://www.selver.ee/search?q=${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Oota, et tooted laadiks
        await page.waitForSelector('[data-product-id], .product-item, .product-tile', { timeout: 10000 }).catch(() => {});
        
        const products = await page.evaluate(() => {
            const items = document.querySelectorAll('[data-product-id], .product-item, .product-tile, .product-list__item');
            const results = [];
            const seen = new Set();
            
            for (const item of items) {
                try {
                    // Nimi
                    let name = null;
                    const nameSelectors = ['.product-name', '.name', '.product-title', 'h2', 'h3'];
                    for (const selector of nameSelectors) {
                        const elem = item.querySelector(selector);
                        if (elem) {
                            name = elem.textContent.trim();
                            break;
                        }
                    }
                    if (!name) name = item.textContent.trim();
                    if (!name || name.length < 3) continue;
                    
                    // Väldi dubleerimist
                    const nameKey = name.toLowerCase().slice(0, 40);
                    if (seen.has(nameKey)) continue;
                    seen.add(nameKey);
                    
                    // Hind
                    let price = null;
                    const priceSelectors = ['.price', '.product-price', '.price-value', '.final-price'];
                    for (const selector of priceSelectors) {
                        const elem = item.querySelector(selector);
                        if (elem) {
                            const priceText = elem.textContent.trim();
                            const match = priceText.match(/(\d+[.,]\d{2})\s*€?/);
                            if (match) {
                                price = parseFloat(match[1].replace(',', '.'));
                                break;
                            }
                        }
                    }
                    
                    // Kui hinda ei leitud, proovi kogu tekstist
                    if (!price) {
                        const fullText = item.textContent;
                        const matches = fullText.match(/(\d+[.,]\d{2})\s*€/g);
                        if (matches && matches.length > 0) {
                            const match = matches[0].match(/(\d+[.,]\d{2})/);
                            if (match) price = parseFloat(match[1].replace(',', '.'));
                        }
                    }
                    
                    // URL
                    let url = '';
                    const link = item.querySelector('a[href]');
                    if (link) {
                        let href = link.getAttribute('href');
                        if (href) {
                            if (href.startsWith('http')) {
                                url = href;
                            } else {
                                url = `https://www.selver.ee${href}`;
                            }
                        }
                    }
                    
                    results.push({
                        name: name.slice(0, 200),
                        price_eur: price,
                        url: url,
                        store: 'Selver'
                    });
                } catch (error) {
                    // ignore
                }
            }
            
            return results;
        });
        
        console.log(`✅ Selver (Puppeteer): ${products.length} toodet`);
        return products.slice(0, 20);
        
    } catch (error) {
        console.log(`❌ Selver Puppeteer viga: ${error.message}`);
        return [];
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (error) {
                console.log('❌ Browser sulgemine ebaõnnestus');
            }
        }
    }
}

// ----------------------------
// SELVER PROXYGA (VARUVARIANT)
=======
// SELVER PROXYGA
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
// ----------------------------
async function searchSelver(query) {
    try {
        const url = `https://www.selver.ee/search?q=${encodeURIComponent(query)}`;
<<<<<<< HEAD
        console.log(`🔍 Otsin Selverist (proxy): ${query}`);
=======
        console.log(`🔍 Otsin Selverist: ${query}`);
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
        
        const response = await requestWithProxy(url);
        if (!response) {
            console.log('❌ Selver - ükski proxy ei töötanud');
            return [];
        }
        
        const $ = cheerio.load(response.data);
        const products = [];
        const seen = new Set();
        
<<<<<<< HEAD
        // Proovi erinevaid selektoreid
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
        let items = $('[data-product-id], .product-item, .product-tile, .product-list__item');
        if (items.length === 0) {
            items = $('a[href*="/toode/"], a[href*="/product/"]');
        }
        
        items.each((index, element) => {
            if (products.length >= 20) return false;
            
            try {
                const $item = $(element);
<<<<<<< HEAD
                
                // Nimi
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
                let name = $item.find('.product-name, .name, .product-title, h2, h3').first().text().trim();
                if (!name) name = $item.text().trim();
                if (!name || name.length < 3) return;
                
<<<<<<< HEAD
                // Väldi dubleerimist
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
                const nameKey = name.toLowerCase().slice(0, 40);
                if (seen.has(nameKey)) return;
                seen.add(nameKey);
                
<<<<<<< HEAD
                // Hind
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
                let price = null;
                const priceText = $item.find('.price, .product-price, .price-value, .final-price').first().text().trim();
                if (priceText) {
                    const match = priceText.match(/(\d+[.,]\d{2})\s*€?/);
                    if (match) {
                        price = parseFloat(match[1].replace(',', '.'));
                    }
                }
                
<<<<<<< HEAD
                // Kui hinda ei leitud, proovi kogu tekstist
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
                if (!price) {
                    const fullText = $item.text();
                    const matches = fullText.match(/(\d+[.,]\d{2})\s*€/g);
                    if (matches && matches.length > 0) {
                        const match = matches[0].match(/(\d+[.,]\d{2})/);
                        if (match) price = parseFloat(match[1].replace(',', '.'));
                    }
                }
                
<<<<<<< HEAD
                // URL
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
                let url = '';
                const link = $item.find('a[href]').first();
                if (link.length > 0) {
                    let href = link.attr('href');
                    if (href) {
                        if (href.startsWith('http')) {
                            url = href;
                        } else {
                            url = `https://www.selver.ee${href}`;
                        }
                    }
                }
                
                products.push({
                    name: name.slice(0, 200),
                    price_eur: price,
                    url: url,
                    store: 'Selver'
                });
<<<<<<< HEAD
            } catch (error) {
                // ignore
            }
        });
        
        console.log(`✅ Selver (proxy): ${products.length} toodet`);
=======
            } catch (error) {}
        });
        
        console.log(`✅ Selver: ${products.length} toodet`);
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
        return products;
        
    } catch (error) {
        console.log(`❌ Selver viga: ${error.message}`);
        return [];
    }
}

// ----------------------------
<<<<<<< HEAD
// PRISMA
=======
// TEISED POED
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
// ----------------------------
async function searchPrisma(query) {
    try {
        const url = `https://www.prisma.ee/et/otsing?q=${encodeURIComponent(query)}`;
<<<<<<< HEAD
        console.log(`🔍 Otsin Prismast: ${query}`);
        
        const response = await requestWithProxy(url);
        if (!response) {
            console.log('❌ Prisma - ükski proxy ei töötanud');
            return [];
        }
=======
        const response = await requestWithProxy(url);
        if (!response) return [];
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
        
        const $ = cheerio.load(response.data);
        const products = [];
        const seen = new Set();
        
<<<<<<< HEAD
        let items = $('.product-item, .product, .product-tile, .search-result, [data-product-id]');
        if (items.length === 0) {
            items = $('a[href*="/toode/"], a[href*="/product/"], a[href*="/p/"]');
=======
        let items = $('.product-item, .product, .product-tile, [data-product-id]');
        if (items.length === 0) {
            items = $('a[href*="/toode/"], a[href*="/product/"]');
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
        }
        
        items.each((index, element) => {
            if (products.length >= 20) return false;
            
            try {
                const $item = $(element);
                let name = $item.find('.product-name, .name, .title, .product-title, h2, h3').first().text().trim();
                if (!name) name = $item.text().trim();
                if (!name || name.length < 3) return;
                
                const nameKey = name.toLowerCase().slice(0, 40);
                if (seen.has(nameKey)) return;
                seen.add(nameKey);
                
                let price = null;
<<<<<<< HEAD
                const priceText = $item.find('.price, .product-price, .price-value, .amount, .final-price').first().text().trim();
=======
                const priceText = $item.find('.price, .product-price, .price-value, .amount').first().text().trim();
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
                if (priceText) {
                    const match = priceText.match(/(\d+[.,]\d{2})\s*€?/);
                    if (match) {
                        price = parseFloat(match[1].replace(',', '.'));
                    }
                }
                
                if (!price) {
                    const fullText = $item.text();
                    const matches = fullText.match(/(\d+[.,]\d{2})\s*€/g);
                    if (matches && matches.length > 0) {
                        const match = matches[0].match(/(\d+[.,]\d{2})/);
                        if (match) price = parseFloat(match[1].replace(',', '.'));
                    }
                }
                
                let url = '';
                const link = $item.find('a[href]').first();
                if (link.length > 0) {
                    let href = link.attr('href');
                    if (href) {
                        if (href.startsWith('http')) {
                            url = href;
                        } else {
                            url = `https://www.prisma.ee${href}`;
                        }
                    }
                }
                
                products.push({
                    name: name.slice(0, 200),
                    price_eur: price,
                    url: url,
                    store: 'Prisma'
                });
<<<<<<< HEAD
            } catch (error) {
                // ignore
            }
=======
            } catch (error) {}
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
        });
        
        console.log(`✅ Prisma: ${products.length} toodet`);
        return products;
<<<<<<< HEAD
        
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
    } catch (error) {
        console.log(`❌ Prisma viga: ${error.message}`);
        return [];
    }
}

<<<<<<< HEAD
// ----------------------------
// MAXIMA
// ----------------------------
async function searchMaxima(query) {
    try {
        const url = `https://www.maxima.ee/et/search?q=${encodeURIComponent(query)}`;
        console.log(`🔍 Otsin Maximast: ${query}`);
        
        const response = await requestWithProxy(url);
        if (!response) {
            console.log('❌ Maxima - ükski proxy ei töötanud');
            return [];
        }
=======
async function searchMaxima(query) {
    try {
        const url = `https://www.maxima.ee/et/search?q=${encodeURIComponent(query)}`;
        const response = await requestWithProxy(url);
        if (!response) return [];
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
        
        const $ = cheerio.load(response.data);
        const products = [];
        const seen = new Set();
        
<<<<<<< HEAD
        let items = $('.product-item, .product, .product-card, .catalog-product, [data-product-id]');
        if (items.length === 0) {
            items = $('a[href*="/toode/"], a[href*="/product/"], a[href*="/p/"]');
=======
        let items = $('.product-item, .product, .product-card, [data-product-id]');
        if (items.length === 0) {
            items = $('a[href*="/toode/"], a[href*="/product/"]');
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
        }
        
        items.each((index, element) => {
            if (products.length >= 20) return false;
            
            try {
                const $item = $(element);
                let name = $item.find('.product-name, .name, .title, .product-title, h2, h3').first().text().trim();
                if (!name) name = $item.text().trim();
                if (!name || name.length < 3) return;
                
                const nameKey = name.toLowerCase().slice(0, 40);
                if (seen.has(nameKey)) return;
                seen.add(nameKey);
                
                let price = null;
<<<<<<< HEAD
                const priceText = $item.find('.price, .product-price, .price-value, .amount, .final-price').first().text().trim();
=======
                const priceText = $item.find('.price, .product-price, .price-value, .amount').first().text().trim();
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
                if (priceText) {
                    const match = priceText.match(/(\d+[.,]\d{2})\s*€?/);
                    if (match) {
                        price = parseFloat(match[1].replace(',', '.'));
                    }
                }
                
                if (!price) {
                    const fullText = $item.text();
                    const matches = fullText.match(/(\d+[.,]\d{2})\s*€/g);
                    if (matches && matches.length > 0) {
                        const match = matches[0].match(/(\d+[.,]\d{2})/);
                        if (match) price = parseFloat(match[1].replace(',', '.'));
                    }
                }
                
                let url = '';
                const link = $item.find('a[href]').first();
                if (link.length > 0) {
                    let href = link.attr('href');
                    if (href) {
                        if (href.startsWith('http')) {
                            url = href;
                        } else {
                            url = `https://www.maxima.ee${href}`;
                        }
                    }
                }
                
                products.push({
                    name: name.slice(0, 200),
                    price_eur: price,
                    url: url,
                    store: 'Maxima'
                });
<<<<<<< HEAD
            } catch (error) {
                // ignore
            }
=======
            } catch (error) {}
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
        });
        
        console.log(`✅ Maxima: ${products.length} toodet`);
        return products;
<<<<<<< HEAD
        
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
    } catch (error) {
        console.log(`❌ Maxima viga: ${error.message}`);
        return [];
    }
}

<<<<<<< HEAD
// ----------------------------
// RIMI
// ----------------------------
async function searchRimi(query) {
    try {
        const url = `https://www.rimi.ee/api/products?search=${encodeURIComponent(query)}&limit=20`;
        console.log(`🔍 Otsin Rimist: ${query}`);
        
        const headers = {
            ...HEADERS,
            'Accept': 'application/json'
        };
        
        const response = await requestWithProxy(url, headers);
        if (!response) {
            console.log('❌ Rimi - ükski proxy ei töötanud');
            return [];
        }
=======
async function searchRimi(query) {
    try {
        const url = `https://www.rimi.ee/api/products?search=${encodeURIComponent(query)}&limit=20`;
        const headers = { ...HEADERS, 'Accept': 'application/json' };
        const response = await requestWithProxy(url, headers);
        if (!response) return [];
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
        
        const data = response.data;
        const products = [];
        
        let items = [];
        if (Array.isArray(data)) {
            items = data;
        } else if (data && typeof data === 'object') {
            items = data.products || data.data || data.items || [];
        }
        
        for (const item of items.slice(0, 20)) {
            try {
                if (typeof item !== 'object') continue;
<<<<<<< HEAD
                
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
                const name = item.name || item.title || item.product_name;
                if (!name) continue;
                
                let price = null;
                if (item.price !== undefined && item.price !== null) {
                    price = item.price;
                } else if (item.prices && typeof item.prices === 'object') {
                    price = item.prices.price || item.prices.final_price;
                }
                
                if (price) {
                    if (typeof price === 'string') {
                        price = parseFloat(price.replace(',', '.'));
                    } else if (typeof price === 'number' && price > 100) {
                        price = price / 100;
                    }
                }
                
                const url = item.url || item.permalink || item.link || '';
<<<<<<< HEAD
                
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
                products.push({
                    name: name.slice(0, 200),
                    price_eur: price,
                    url: url,
                    store: 'Rimi'
                });
<<<<<<< HEAD
            } catch (error) {
                continue;
            }
=======
            } catch (error) {}
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
        }
        
        console.log(`✅ Rimi: ${products.length} toodet`);
        return products;
<<<<<<< HEAD
        
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
    } catch (error) {
        console.log(`❌ Rimi viga: ${error.message}`);
        return [];
    }
}

// ----------------------------
<<<<<<< HEAD
// API ENDPOINTID
=======
// API ENDPOINT
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
// ----------------------------
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Eesti poodide hinnavõrdlus</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                h1 { color: #333; }
                .search-box { display: flex; gap: 10px; margin: 20px 0; }
                input { flex: 1; padding: 10px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; }
                button { padding: 10px 30px; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; }
                button:hover { background: #0056b3; }
                #results { margin-top: 20px; }
                .store { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #007bff; }
                .store h2 { margin: 0 0 10px 0; font-size: 18px; }
                .product { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
                .product:last-child { border-bottom: none; }
                .price { font-weight: bold; color: #28a745; }
                .loading { text-align: center; padding: 20px; display: none; }
                .total { text-align: center; padding: 10px; background: #e9ecef; border-radius: 8px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>🛒 Eesti poodide hinnavõrdlus</h1>
            <p>Coop · Selver · Prisma · Maxima · Rimi</p>
            
            <div class="search-box">
                <input type="text" id="query" placeholder="Otsi toodet..." value="sai">
                <button onclick="search()">🔍 Otsi</button>
            </div>
            
            <div class="loading" id="loading">⏳ Otsin...</div>
            <div id="results"></div>
            
            <script>
                async function search() {
                    const query = document.getElementById('query').value || 'sai';
                    document.getElementById('loading').style.display = 'block';
                    document.getElementById('results').innerHTML = '';
                    
                    try {
                        const response = await fetch(\`/search?q=\${encodeURIComponent(query)}\`);
                        const data = await response.json();
                        
                        let html = \`<div class="total">📊 Leitud \${data.total_count || 0} toodet</div>\`;
                        
                        for (const store of data.stores) {
<<<<<<< HEAD
                            const isWorking = store.count > 0;
                            const borderColor = isWorking ? '#28a745' : '#dc3545';
                            const status = isWorking ? '✅ Töötab' : '❌ Ei tööta';
=======
                            const hasProducts = store.count > 0;
                            const borderColor = hasProducts ? '#28a745' : '#dc3545';
                            const status = hasProducts ? '✅' : '❌';
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
                            
                            html += \`
                                <div class="store" style="border-left-color: \${borderColor}">
                                    <h2>🏪 \${store.name} (\${store.count}) \${status}</h2>
                                    \${store.products && store.products.length > 0 ? 
                                        store.products.map(p => \`
                                            <div class="product">
                                                <span>\${p.name}</span>
                                                <span class="price">\${p.price_eur ? \`\${p.price_eur.toFixed(2)} €\` : 'Hind puudub'}</span>
                                            </div>
                                        \`).join('') 
                                        : '<div>Tooteid ei leitud</div>'
                                    }
                                </div>
                            \`;
                        }
                        
                        document.getElementById('results').innerHTML = html;
                    } catch (error) {
                        document.getElementById('results').innerHTML = '<div style="color:red;">❌ Viga: ' + error.message + '</div>';
                    }
                    
                    document.getElementById('loading').style.display = 'none';
                }
                
                document.getElementById('query').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') search();
                });
                
                window.onload = search;
            </script>
        </body>
        </html>
    `);
});

app.get('/search', async (req, res) => {
    const query = req.query.q || 'sai';
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📡 Päring: ${query}`);
    console.log('='.repeat(50));
    
    const results = {
        query: query,
        stores: [],
        total_count: 0
    };
    
<<<<<<< HEAD
    // Kõik poed
=======
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
    const stores = [
        { name: 'Coop', fn: searchCoop },
        { name: 'Selver', fn: searchSelver },
        { name: 'Prisma', fn: searchPrisma },
        { name: 'Maxima', fn: searchMaxima },
        { name: 'Rimi', fn: searchRimi },
    ];
    
    for (const store of stores) {
        try {
            const startTime = Date.now();
            const products = await store.fn(query);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            
            results.stores.push({
                name: store.name,
                count: products.length,
                products: products,
                time: `${elapsed}s`
            });
            results.total_count += products.length;
            console.log(`⏱️ ${store.name}: ${elapsed}s - ${products.length} toodet`);
        } catch (error) {
            results.stores.push({
                name: store.name,
                count: 0,
                products: [],
                error: error.message
            });
            console.log(`❌ ${store.name} viga: ${error.message}`);
        }
    }
    
    res.json(results);
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/ping', (req, res) => {
    res.send('OK');
});

// ----------------------------
// KÄIVITUS
// ----------------------------
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server käivitub: http://localhost:${PORT}`);
<<<<<<< HEAD
    console.log(`🔍 Testi: http://localhost:${PORT}/search?q=sai`);
});
=======
});
>>>>>>> 9ff9b36866c0b0420beb9e985786ca0b955663aa
