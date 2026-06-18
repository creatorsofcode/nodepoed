const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// ----------------------------
// SCRAPERAPI VÕTI
// ----------------------------
const SCRAPER_API_KEY = '18ab58b0d0b512941eaf40ceb2d66ac5';

app.use(cors());
app.use(express.json());

// ----------------------------
// PÄISED
// ----------------------------
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'et-EE,et;q=0.9,en;q=0.8',
};

// ----------------------------
// COOP (API, TÖÖTAB ALATI)
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
// SELVER - SCRAPERAPI RENDERDUSEGA
// ----------------------------
async function searchSelver(query) {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=https://www.selver.ee/search?q=${encodedQuery}&render=true&wait_for=.product-item&wait_for=5000&country_code=ee`;

        console.log(`🔍 Otsin Selverist ScraperAPI renderdusega: ${query}`);

        const response = await axios.get(url, {
            timeout: 60000,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            }
        });

        if (!response.data || response.data.length < 10000) {
            console.log('⚠️ Selver ScraperAPI: vastus liiga väike');
            return [];
        }

        if (response.data.includes('Cloudflare') || response.data.includes('cf-browser-verification')) {
            console.log('⚠️ ScraperAPI tagastas Cloudflare\'i lehe! Proovime uuesti...');
            return await searchSelverFallback(query);
        }

        console.log(`✅ Selver ScraperAPI: leht laetud (${response.data.length} baiti)`);
        return parseSelverHtml(response.data);

    } catch (error) {
        console.log(`❌ Selver ScraperAPI viga: ${error.message}`);
        return await searchSelverFallback(query);
    }
}

// ----------------------------
// SELVER - VARUVARIANT
// ----------------------------
async function searchSelverFallback(query) {
    try {
        console.log(`🔄 Proovin Selverit ilma renderduseta...`);
        const encodedQuery = encodeURIComponent(query);
        const url = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=https://www.selver.ee/search?q=${encodedQuery}&country_code=ee`;

        const response = await axios.get(url, {
            timeout: 30000
        });

        if (response.data && response.data.length > 5000) {
            return parseSelverHtml(response.data);
        }
        return [];
    } catch (error) {
        console.log(`❌ Selver fallback viga: ${error.message}`);
        return [];
    }
}

// ----------------------------
// PARSE SELVER HTML
// ----------------------------
function parseSelverHtml(html) {
    const $ = cheerio.load(html);
    const products = [];
    const seen = new Set();

    const selectors = [
        '[data-product-id]',
        '.product-item',
        '.product-tile',
        '.product-list__item',
        '.product',
        '.search-result-item',
        '.product-card',
        '.product-box',
        'article.product',
        'div[class*="product"]'
    ];

    let items = $();
    for (const selector of selectors) {
        const found = $(selector);
        if (found.length > 0) {
            items = found;
            console.log(`✅ Leitud ${found.length} elementi selektoriga: ${selector}`);
            break;
        }
    }

    if (items.length === 0) {
        items = $('a[href*="/toode/"], a[href*="/product/"]');
        console.log(`🔗 Leitud ${items.length} linki toodetele`);
    }

    if (items.length === 0) {
        const allLinks = $('a[href]');
        allLinks.each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 10 && text.length < 100) {
                items = items.add(el);
            }
        });
        console.log(`🔗 Leitud ${items.length} potentsiaalset tootelinki`);
    }

    items.each((index, element) => {
        if (products.length >= 20) return false;
        try {
            const $item = $(element);
            let name = $item.find('.product-name, .name, .product-title, h2, h3, .title, .product-title, [data-testid="product-name"]').first().text().trim();
            if (!name) name = $item.text().trim();
            if (!name || name.length < 3) return;

            name = name.replace(/\s+/g, ' ').trim();

            const nameKey = name.toLowerCase().slice(0, 40);
            if (seen.has(nameKey)) return;
            seen.add(nameKey);

            let price = null;
            const priceSelectors = ['.price', '.product-price', '.price-value', '.final-price', '.amount', '.product-price__price', '[data-testid="product-price"]'];
            let priceText = '';
            for (const ps of priceSelectors) {
                const pEl = $item.find(ps).first();
                if (pEl.length > 0) {
                    priceText = pEl.text().trim();
                    break;
                }
            }
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
        } catch (error) {}
    });

    console.log(`✅ Selver: ${products.length} toodet`);
    return products;
}

// ----------------------------
// FRONTEND
// ----------------------------
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Coop & Selver hinnavõrdlus</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 900px; margin: 50px auto; padding: 20px; }
                h1 { color: #333; }
                .search-box { display: flex; gap: 10px; margin: 20px 0; }
                input { flex: 1; padding: 10px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; }
                button { padding: 10px 30px; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; }
                button:hover { background: #0056b3; }
                #results { margin-top: 20px; }
                .store-section { margin: 15px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
                .store-section.coop { border-left-color: #28a745; }
                .store-section.selver { border-left-color: #dc3545; }
                .store-section h2 { margin: 0 0 10px 0; font-size: 18px; }
                .product { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
                .product:last-child { border-bottom: none; }
                .price { font-weight: bold; color: #28a745; }
                .loading { text-align: center; padding: 20px; display: none; }
                .total { background: #e9ecef; padding: 10px; border-radius: 8px; margin: 10px 0; text-align: center; }
                .no-results { color: #999; font-style: italic; }
                .store-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                @media (max-width: 768px) {
                    .store-grid { grid-template-columns: 1fr; }
                }
            </style>
        </head>
        <body>
            <h1>🛒 Coop & Selver hinnavõrdlus</h1>
            <div class="search-box">
                <input type="text" id="query" placeholder="Otsi toodet..." value="sai">
                <button onclick="search()">🔍 Otsi</button>
            </div>
            <div class="loading" id="loading">⏳ Otsin tooteid...</div>
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
                        html += \`<div class="store-grid">\`;
                        
                        for (const store of data.stores) {
                            const cls = store.name === 'Coop' ? 'coop' : 'selver';
                            html += \`<div class="store-section \${cls}"><h2>🏪 \${store.name} (\${store.count})</h2>\`;
                            if (store.products && store.products.length > 0) {
                                html += store.products.map(p => \`
                                    <div class="product">
                                        <span>\${p.name}</span>
                                        <span class="price">\${p.price_eur ? \`\${p.price_eur.toFixed(2)} €\` : 'Hind puudub'}</span>
                                    </div>
                                \`).join('');
                            } else {
                                html += '<div class="no-results">Tooteid ei leitud</div>';
                            }
                            html += \`</div>\`;
                        }
                        html += \`</div>\`;
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

// ----------------------------
// API ENDPOINT
// ----------------------------
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

    const stores = [
        { name: 'Coop', fn: searchCoop },
        { name: 'Selver', fn: searchSelver },
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
    console.log(`🚀 Server käivitub pordil: ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
});