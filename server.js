require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.SMSBOWER_API_KEY;
const BASE_URL = "https://smsbower.page/stubs/handler_api.php";

// Cache
let cachedOperators = null;
let lastFetchTime = null;

// Informasi Rank
const rankInfo = {
    'Gold': {
        color: 'text-yellow-600',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        delivery: '40%+',
        volume: '2000+ / day',
        description: 'Maximum reliability & delivery',
        icon: 'fa-crown'
    },
    'Silver': {
        color: 'text-gray-500',
        bg: 'bg-gray-100 dark:bg-gray-800',
        delivery: '20-40%',
        volume: '1000+ / day',
        description: 'Promising positions',
        icon: 'fa-medal'
    },
    'Bronze': {
        color: 'text-amber-600',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        delivery: '5-20%',
        volume: 'up to 1000 / day',
        description: 'Suitable for limited budget',
        icon: 'fa-certificate'
    }
};

// ========================
// BALANCE
// ========================
app.get("/api/balance", async (req, res) => {
    try {
        const response = await axios.get(
            `${BASE_URL}?action=getBalance&api_key=${API_KEY}`
        );
        res.send(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// GET DANA OPERATORS
// ========================
app.get("/api/dana-operators", async (req, res) => {
    console.log(`\n========== Fetching DANA operators from combined APIs ==========`);
    
    try {
        if (cachedOperators && lastFetchTime && (Date.now() - lastFetchTime) < 120000) {
            console.log("Returning cached data");
            return res.json(cachedOperators);
        }
        
        const allOperators = [];
        const operatorIds = new Set();
        
        // ========== 1. AMBIL DARI getTopCountriesByService ==========
        try {
            const topUrl = `${BASE_URL}?api_key=${API_KEY}&action=getTopCountriesByService&service=fr`;
            console.log("Fetching from getTopCountriesByService...");
            
            const topResponse = await axios.get(topUrl, { timeout: 10000 });
            const topData = topResponse.data;
            
            console.log("TopCountries response:", JSON.stringify(topData));
            
            for (const countryName in topData) {
                const partners = topData[countryName];
                for (const partnerId in partners) {
                    const info = partners[partnerId];
                    if (!operatorIds.has(partnerId)) {
                        operatorIds.add(partnerId);
                        allOperators.push({
                            id: partnerId,
                            rank: "Gold",
                            price: info.price,
                            stock: info.count,
                            operator: `Gold Partner ${partnerId}`,
                            country: countryName,
                            source: "topCountries"
                        });
                    }
                }
            }
        } catch (err) {
            console.log("getTopCountriesByService error:", err.message);
        }
        
        // ========== 2. AMBIL DARI getPricesV3 ==========
        try {
            const pricesUrl = `${BASE_URL}?api_key=${API_KEY}&action=getPricesV3&service=fr&country=6`;
            console.log("Fetching from getPricesV3...");
            
            const pricesResponse = await axios.get(pricesUrl, { timeout: 10000 });
            const pricesData = pricesResponse.data;
            
            if (pricesData && pricesData["6"] && pricesData["6"]["fr"]) {
                const providers = pricesData["6"]["fr"];
                for (const providerId in providers) {
                    if (!operatorIds.has(providerId)) {
                        const info = providers[providerId];
                        let rank = "Bronze";
                        if (info.price < 0.025) {
                            rank = "Gold";
                        } else if (info.price < 0.05) {
                            rank = "Silver";
                        } else {
                            rank = "Bronze";
                        }
                        
                        operatorIds.add(providerId);
                        allOperators.push({
                            id: providerId,
                            rank: rank,
                            price: info.price,
                            stock: info.count,
                            operator: `${rank} Partner ${providerId}`,
                            country: "Indonesia",
                            source: "pricesV3"
                        });
                    }
                }
            }
        } catch (err) {
            console.log("getPricesV3 error:", err.message);
        }
        
        allOperators.sort((a, b) => a.price - b.price);
        const totalStock = allOperators.reduce((sum, op) => sum + op.stock, 0);
        
        cachedOperators = {
            service: "DANA",
            source: "combined (topCountries + pricesV3)",
            last_update: new Date().toISOString(),
            operators: allOperators,
            summary: {
                total_stock: totalStock,
                price_range: {
                    min: allOperators[0]?.price,
                    max: allOperators[allOperators.length - 1]?.price
                },
                total_operators: allOperators.length
            }
        };
        
        lastFetchTime = Date.now();
        
        console.log(`✅ Total ${allOperators.length} operators found`);
        console.log(`💰 Price range: $${cachedOperators.summary.price_range.min} - $${cachedOperators.summary.price_range.max}`);
        console.log(`📦 Total stock: ${totalStock.toLocaleString()} pcs`);
        
        res.json(cachedOperators);
        
    } catch (err) {
        console.error("ERROR:", err.message);
        
        const fallbackOperators = [
            { id: "1329", rank: "Gold", price: 0.007, stock: 1461, operator: "Gold Partner 1329", country: "Indonesia" },
            { id: "3289", rank: "Gold", price: 0.008, stock: 266, operator: "Gold Partner 3289", country: "Indonesia" },
            { id: "3267", rank: "Gold", price: 0.010, stock: 576, operator: "Gold Partner 3267", country: "Indonesia" },
            { id: "3160", rank: "Gold", price: 0.014, stock: 48869, operator: "Gold Partner 3160", country: "Indonesia" },
            { id: "3408", rank: "Gold", price: 0.018, stock: 461, operator: "Gold Partner 3408", country: "Indonesia" },
            { id: "3406", rank: "Gold", price: 0.020, stock: 35184, operator: "Gold Partner 3406", country: "Indonesia" },
            { id: "2295", rank: "Gold", price: 0.035, stock: 7102, operator: "Gold Partner 2295", country: "Indonesia" },
            { id: "1507", rank: "Gold", price: 0.102, stock: 139, operator: "Gold Partner 1507", country: "Indonesia" }
        ];
        
        res.json({
            service: "DANA",
            source: "fallback",
            last_update: new Date().toISOString(),
            operators: fallbackOperators,
            summary: {
                total_stock: fallbackOperators.reduce((s, o) => s + o.stock, 0),
                price_range: { min: 0.007, max: 0.102 },
                total_operators: fallbackOperators.length
            }
        });
    }
});

// ========================
// GET NUMBER WITH SPECIFIC PROVIDER
// ========================
app.get("/api/get-dana-number", async (req, res) => {
    try {
        const { operatorId, maxPrice, minPrice } = req.query;
        const country = '6';
        const service = 'fr';
        
        let url = `${BASE_URL}?api_key=${API_KEY}&action=getNumber&service=${service}&country=${country}`;
        
        if (operatorId && operatorId !== 'undefined') {
            url += `&providerIds=${operatorId}`;
            console.log(`📞 Getting number with specific provider: ${operatorId}`);
        }
        
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        if (minPrice) url += `&minPrice=${minPrice}`;
        
        console.log("URL:", url.replace(API_KEY, "HIDDEN"));
        
        const response = await axios.get(url);
        console.log("Response:", response.data);
        res.send(response.data);
        
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ========================
// GET STATUS
// ========================
app.get("/api/status/:id", async (req, res) => {
    try {
        const response = await axios.get(
            `${BASE_URL}?api_key=${API_KEY}&action=getStatus&id=${req.params.id}`
        );
        res.send(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// SET STATUS
// ========================
app.get("/api/set-status/:id/:status", async (req, res) => {
    try {
        const response = await axios.get(
            `${BASE_URL}?api_key=${API_KEY}&action=setStatus&id=${req.params.id}&status=${req.params.status}`
        );
        res.send(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// GET HISTORY
// ========================
app.get("/api/history", async (req, res) => {
    try {
        const response = await axios.get(
            `${BASE_URL}?api_key=${API_KEY}&action=getNumbersStatus`
        );
        
        let data = response.data;
        let history = [];
        
        if (typeof data === 'object' && data !== null) {
            for (const id in data) {
                const item = data[id];
                history.push({
                    id: id,
                    phone: item.phone || item.number || '-',
                    sms: item.sms || item.code || '',
                    status: item.status || 'Unknown',
                    price: parseFloat(item.price) || 0,
                    date: item.date || item.created_at || new Date().toISOString(),
                    timestamp: item.timestamp || Date.now()
                });
            }
        }
        
        history.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json({
            success: true,
            total: history.length,
            history: history
        });
        
    } catch (err) {
        console.error("History error:", err.message);
        res.json({
            success: true,
            total: 0,
            history: [],
            message: "No history data available"
        });
    }
});

// ========================
// DEBUG
// ========================
app.get("/api/debug", async (req, res) => {
    const results = {};
    
    try {
        const topRes = await axios.get(`${BASE_URL}?api_key=${API_KEY}&action=getTopCountriesByService&service=fr`);
        results.topCountries = topRes.data;
    } catch (e) {
        results.topCountries = { error: e.message };
    }
    
    res.json(results);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════════════════════════╗`);
    console.log(`║   🚀 DANA OTP DASHBOARD - COMBINED API                   ║`);
    console.log(`╠══════════════════════════════════════════════════════════╣`);
    console.log(`║   URL: http://localhost:${PORT}                             ║`);
    console.log(`║   Debug: http://localhost:${PORT}/api/debug                ║`);
    console.log(`╚══════════════════════════════════════════════════════════╝\n`);
});