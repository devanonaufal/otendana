// ========================
// STATE
// ========================
let activeOrders = [];
let selectedOperator = null;
let allOperators = [];
let currentRankFilter = 'all';
let timerInterval = null;

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
// LOCALSTORAGE - SAVE & LOAD ORDERS
// ========================
function saveOrdersToLocalStorage() {
    try {
        const ordersToSave = activeOrders.map(order => ({
            activationId: order.activationId,
            number: order.number,
            numberWithoutCode: order.numberWithoutCode,
            numberWithCode: order.numberWithCode,
            service: order.service,
            country: order.country,
            price: order.price,
            rank: order.rank,
            operator: order.operator,
            operatorId: order.operatorId,
            status: order.status,
            otp: order.otp,
            createdAt: order.createdAt,
            otpHistory: order.otpHistory || []
        }));
        localStorage.setItem('dana_active_orders', JSON.stringify(ordersToSave));
    } catch (err) { console.error('Save failed:', err); }
}

function loadOrdersFromLocalStorage() {
    try {
        const saved = localStorage.getItem('dana_active_orders');
        if (saved) {
            const savedOrders = JSON.parse(saved);
            activeOrders = savedOrders.map(order => ({
                ...order,
                pollingInterval: null,
                otpHistory: order.otpHistory || []
            }));
            activeOrders.forEach(order => {
                if (order.status === 'waiting') {
                    startPolling(order);
                }
            });
            renderActiveOrders();
            console.log(`Loaded ${activeOrders.length} orders from localStorage`);
        }
    } catch (err) { console.error('Load failed:', err); }
}

// ========================
// HISTORY - SAVE TO LOCALSTORAGE
// ========================
function saveToHistory(order, status) {
    try {
        const history = JSON.parse(localStorage.getItem('dana_history') || '[]');
        
        const exists = history.some(h => h.id === order.activationId);
        
        if (!exists) {
            let priceValue = parseFloat(order.price);
            let formattedPrice = priceValue.toString();
            if (formattedPrice === '0') formattedPrice = '0';
            
            history.unshift({
                id: order.activationId,
                phone: order.number,
                sms: order.otp || '',
                status: status,
                price: formattedPrice,
                date: new Date().toLocaleString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                timestamp: Date.now()
            });
            
            const limited = history.slice(0, 100);
            localStorage.setItem('dana_history', JSON.stringify(limited));
            console.log('Saved to history:', order.activationId, status, formattedPrice);
        }
    } catch(e) { console.error('Save history error:', e); }
}

// ========================
// NOTIFICATION SOUNDS
// ========================
function playBeep() {
    try {
        const audio = document.getElementById('notifSmsAudio');
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Play failed:', e));
        }
    } catch (err) { console.log('Beep error:', err); }
}

function playOtpNotification() {
    try {
        const audio = document.getElementById('notifSmsAudio');
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 1.0;
            audio.play().catch(e => console.log('Play failed:', e));
            
            setTimeout(() => {
                const audio2 = document.getElementById('notifSmsAudio');
                if (audio2) {
                    audio2.currentTime = 0;
                    audio2.play().catch(e => console.log('Second play failed:', e));
                }
            }, 200);
        }
    } catch (err) { console.log('Notification error:', err); }
}

// ========================
// BROWSER NOTIFICATION
// ========================
async function sendBrowserNotification(otp, number) {
    if (Notification.permission === 'granted') {
        new Notification('📩 OTP DITERIMA!', {
            body: `Kode OTP: ${otp}\nNomor: ${number}`,
            icon: 'https://smsvirtual.co/smsvirtual.co.png',
            tag: 'otp-notification',
            requireInteraction: true
        });
    } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            new Notification('📩 OTP DITERIMA!', {
                body: `Kode OTP: ${otp}\nNomor: ${number}`,
                icon: 'https://smsvirtual.co/smsvirtual.co.png'
            });
        }
    }
}

// ========================
// FORMAT HARGA
// ========================
function formatPrice(price) {
    if (price === undefined || price === null) return 'N/A';
    return '$' + parseFloat(price).toString();
}

// ========================
// FORMAT NOMOR
// ========================
function formatNumberWithoutCountryCode(phoneNumber) {
    let number = phoneNumber.toString();
    number = number.replace(/^\+62/, '');
    number = number.replace(/^62/, '');
    number = number.replace(/^0/, '');
    return number;
}

function formatNumberWithCountryCode(phoneNumber) {
    let number = phoneNumber.toString();
    number = number.replace(/^\+62/, '');
    number = number.replace(/^62/, '');
    number = number.replace(/^0/, '');
    return '62' + number;
}

// ========================
// FORMAT NUMBER (ribuan)
// ========================
function formatNumber(num) {
    return num.toLocaleString();
}

// ========================
// TOAST NOTIFICATION (Warna font PUTIH)
// ========================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toastMsg');
    if (!toast) return;
    
    const bgColor = type === 'success' 
        ? 'bg-green-600 dark:bg-green-700' 
        : 'bg-red-600 dark:bg-red-700';
    const borderColor = type === 'success' 
        ? 'border-green-400' 
        : 'border-red-400';
    const icon = type === 'success' 
        ? 'fa-check-circle' 
        : 'fa-exclamation-triangle';
    
    toast.innerHTML = `
        <div class="${bgColor} ${borderColor} border-l-4 rounded-xl px-5 py-3 shadow-xl flex items-center gap-3 min-w-[250px]">
            <i class="fas ${icon} text-white text-lg"></i>
            <span class="text-sm font-medium text-white">${message}</span>
        </div>
    `;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ========================
// COPY TO CLIPBOARD
// ========================
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast(`Copied: ${text}`, 'success');
}

// ========================
// BALANCE
// ========================
async function checkBalance() {
    try {
        const res = await fetch('/api/balance');
        const text = await res.text();
        let balance = text.includes(':') ? text.split(':')[1] : text;
        balance = parseFloat(balance).toFixed(4);
        const balanceEl = document.getElementById('balanceDisplay');
        if (balanceEl) balanceEl.innerHTML = `<i class="fas fa-coins mr-1"></i> $${balance}`;
    } catch (err) {
        console.error(err);
    }
}

// ========================
// LOAD DANA PRICES
// ========================
async function loadDanaPrices() {
    const container = document.getElementById('priceListContainer');
    if (!container) return;
    
    try {
        container.innerHTML = '<div class="text-center py-8 text-slate-400"><i class="fas fa-spinner fa-pulse mr-2"></i> Loading prices...</div>';
        
        const res = await fetch('/api/dana-operators');
        const data = await res.json();
        
        console.log('API Response:', data);
        
        if (data && data.operators && data.operators.length > 0) {
            allOperators = data.operators;
            
            if (data.summary) {
                const summaryHtml = `
                    <span>💰 ${formatPrice(data.summary.price_range.min)} - ${formatPrice(data.summary.price_range.max)}</span>
                    <span>📦 ${formatNumber(data.summary.total_stock)} total</span>
                    <span>🕐 ${new Date(data.last_update).toLocaleTimeString()}</span>
                    <span>🔌 ${data.summary.total_operators} ops</span>
                `;
                const summaryEl = document.getElementById('priceSummary');
                if (summaryEl) summaryEl.innerHTML = summaryHtml;
            }
        } else {
            allOperators = [];
        }
        
        renderPriceList();
        showToast(`Loaded ${allOperators.length} options`, 'success');
        
    } catch (err) {
        console.error('Error:', err);
        container.innerHTML = '<div class="text-center py-8 text-red-400">Failed to load prices</div>';
    }
}

// ========================
// RENDER PRICE LIST
// ========================
function renderPriceList() {
    const container = document.getElementById('priceListContainer');
    if (!container) return;
    
    let filtered = allOperators;
    if (currentRankFilter !== 'all') {
        filtered = allOperators.filter(op => op.rank === currentRankFilter);
    }
    
    filtered.sort((a, b) => a.price - b.price);
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-slate-400">No operators found</div>';
        return;
    }
    
    container.innerHTML = filtered.map(opt => {
        const rank = rankInfo[opt.rank] || rankInfo['Bronze'];
        const isSelected = selectedOperator && selectedOperator.id === opt.id;
        
        return `
            <div class="price-card p-4 ${isSelected ? 'selected' : ''}" 
                 data-id="${opt.id}" 
                 data-price="${opt.price}" 
                 data-rank="${opt.rank}" 
                 data-stock="${opt.stock}" 
                 data-operator="${opt.operator}">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <i class="fas ${rank.icon} ${rank.color}"></i>
                            <span class="font-bold text-xl text-gray-800 dark:text-white">${formatPrice(opt.price)}</span>
                            <span class="text-xs px-2 py-0.5 rounded-full ${rank.bg} ${rank.color} font-semibold">${opt.rank}</span>
                            <span class="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                <i class="fas fa-chart-line mr-1"></i> ${rank.delivery}
                            </span>
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            <i class="fas fa-hashtag mr-1"></i> ID: ${opt.id}
                        </div>
                        <div class="text-xs text-gray-400 mt-1">
                            <i class="fas fa-info-circle mr-1"></i> ${rank.description}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-semibold text-green-600 dark:text-green-400">
                            <i class="fas fa-box mr-1"></i> ${formatNumber(opt.stock)} pcs
                        </div>
                        <div class="text-xs text-gray-400 mt-1">
                            <i class="fas fa-chart-simple mr-1"></i> ${rank.volume}
                        </div>
                    </div>
                </div>
                <div class="mt-3 flex justify-end">
                    <button class="buy-btn text-sm px-5 py-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition font-medium">
                        <i class="fas fa-shopping-cart mr-1"></i> Buy Now
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.price-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('buy-btn')) return;
            selectedOperator = {
                id: card.dataset.id,
                price: parseFloat(card.dataset.price),
                rank: card.dataset.rank,
                stock: parseInt(card.dataset.stock),
                operator: card.dataset.operator
            };
            renderPriceList();
            showToast(`Selected: ${formatPrice(selectedOperator.price)}`, 'success');
        });
    });
    
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.price-card');
            selectedOperator = {
                id: card.dataset.id,
                price: parseFloat(card.dataset.price),
                rank: card.dataset.rank,
                stock: parseInt(card.dataset.stock),
                operator: card.dataset.operator
            };
            renderPriceList();
            getNumber();
        });
    });
}

// ========================
// GET NUMBER
// ========================
async function getNumber() {
    if (!selectedOperator) {
        showToast('Please select a price/operator first', 'error');
        return;
    }

    if (activeOrders.length >= 6) {
        showToast('Maximum 6 active orders', 'error');
        return;
    }

    const btn = document.querySelector('.buy-btn');
    if (!btn) return;
    
    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Getting...';
        
        const maxPrice = selectedOperator.price + 0.001;
        const minPrice = selectedOperator.price - 0.001;
        
        const res = await fetch(`/api/get-dana-number?maxPrice=${maxPrice}&minPrice=${minPrice}&operatorId=${selectedOperator.id}`);
        const text = await res.text();
        const parts = text.split(':');

        if (parts[0] !== 'ACCESS_NUMBER') {
            showToast(text, 'error');
            return;
        }

        const newOrder = {
            activationId: parts[1],
            number: parts[2],
            numberWithoutCode: formatNumberWithoutCountryCode(parts[2]),
            numberWithCode: formatNumberWithCountryCode(parts[2]),
            service: 'DANA',
            country: 'Indonesia',
            price: selectedOperator.price,
            rank: selectedOperator.rank,
            operator: selectedOperator.operator,
            operatorId: selectedOperator.id,
            status: 'waiting',
            otp: null,
            pollingInterval: null,
            createdAt: Date.now(),
            otpHistory: []
        };

        activeOrders.unshift(newOrder);
        renderActiveOrders();
        startPolling(newOrder);
        checkBalance();
        saveOrdersToLocalStorage();
        showToast(`✅ Number ready!`, 'success');

    } catch (err) {
        showToast('Failed to get number', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-shopping-cart mr-1"></i> Buy Now';
    }
}

// ========================
// POLLING OTP (Dengan Riwayat OTP dalam 1 card)
// ========================
function startPolling(order) {
    if (order.pollingInterval) clearInterval(order.pollingInterval);
    
    order.pollingInterval = setInterval(async () => {
        try {
            const res = await fetch(`/api/status/${order.activationId}`);
            const text = await res.text();

            if (text.startsWith('STATUS_OK')) {
                const otp = text.split(':')[1];
                
                if (!order.otpHistory) order.otpHistory = [];
                
                const isDuplicate = order.otpHistory.some(item => item.otp === otp);
                
                if (!isDuplicate) {
                    order.otpHistory.unshift({
                        otp: otp,
                        timestamp: Date.now(),
                        date: new Date().toLocaleString()
                    });
                }
                
                order.otp = otp;
                order.status = 'received';
                clearInterval(order.pollingInterval);
                renderActiveOrders();
                saveOrdersToLocalStorage();
                saveToHistory(order, 'Success');
                showToast(`📩 OTP: ${otp}`, 'success');
                playOtpNotification();
                sendBrowserNotification(otp, order.number);
                document.title = `📩 ${otp} - DANA OTP`;
                setTimeout(() => { document.title = 'DANA OTP - Receive SMS Online'; }, 5000);
            } else if (text === 'STATUS_CANCEL' || text === 'STATUS_EXPIRE') {
                order.status = 'cancelled';
                clearInterval(order.pollingInterval);
                renderActiveOrders();
                saveOrdersToLocalStorage();
                showToast('Order cancelled', 'error');
            }
        } catch (err) {
            console.error(err);
        }
    }, 5000);
}

// ========================
// CANCEL ORDER
// ========================
async function cancelOrder(orderId) {
    const order = activeOrders.find(o => o.activationId === orderId);
    if (!order) return;

    try {
        await fetch(`/api/set-status/${orderId}/8`);
        if (order.pollingInterval) clearInterval(order.pollingInterval);
        activeOrders = activeOrders.filter(o => o.activationId !== orderId);
        renderActiveOrders();
        checkBalance();
        saveOrdersToLocalStorage();
        saveToHistory(order, 'Cancelled');
        showToast('Order cancelled', 'error');
    } catch (err) {
        showToast('Failed to cancel', 'error');
    }
}

// ========================
// RECEIVE ANOTHER SMS
// ========================
async function receiveAnotherSms(orderId) {
    const order = activeOrders.find(o => o.activationId === orderId);
    if (!order) {
        showToast('Order not found', 'error');
        return;
    }

    try {
        await fetch(`/api/set-status/${orderId}/1`);
        
        const retryRes = await fetch(`/api/set-status/${orderId}/3`);
        const text = await retryRes.text();
        
        console.log('Receive Another SMS response:', text);
        
        if (text === 'ACCESS_RETRY_GET' || text.includes('RETRY')) {
            order.status = 'waiting';
            
            if (order.pollingInterval) clearInterval(order.pollingInterval);
            startPolling(order);
            
            renderActiveOrders();
            saveOrdersToLocalStorage();
            showToast('Requesting new SMS... Please wait', 'success');
        } else {
            showToast(`Failed: ${text}`, 'error');
        }
    } catch (err) {
        console.error('Receive another SMS error:', err);
        showToast('Failed to request new SMS', 'error');
    }
}

// ========================
// COMPLETE ORDER
// ========================
async function completeOrder(orderId) {
    const order = activeOrders.find(o => o.activationId === orderId);
    if (!order) return;

    try {
        const res = await fetch(`/api/set-status/${orderId}/6`);
        const text = await res.text();
        console.log('Complete response:', text);
        
        if (order.pollingInterval) clearInterval(order.pollingInterval);
        activeOrders = activeOrders.filter(o => o.activationId !== orderId);
        renderActiveOrders();
        checkBalance();
        saveOrdersToLocalStorage();
        saveToHistory(order, 'Success');
        showToast('Order completed!', 'success');
    } catch (err) {
        console.error('Complete error:', err);
        showToast('Failed to complete', 'error');
    }
}

// ========================
// START TIMERS (Countdown 25 menit)
// ========================
function startAllTimers() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        document.querySelectorAll('.timer-display').forEach(timerEl => {
            const createdAt = parseInt(timerEl.dataset.created);
            const elapsedSeconds = Math.floor((Date.now() - createdAt) / 1000);
            const remainingSeconds = Math.max(0, 1500 - elapsedSeconds);
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timerEl.textContent = timeString;
            
            if (remainingSeconds <= 0) {
                timerEl.classList.add('text-red-500', 'font-bold');
                timerEl.textContent = '00:00';
            }
        });
    }, 1000);
}

// ========================
// RENDER ACTIVE ORDERS (Dengan riwayat OTP dalam 1 card)
// ========================
function renderActiveOrders() {
    const container = document.getElementById('activeOrdersList');
    if (!container) return;
    
    if (activeOrders.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm"><i class="fas fa-inbox text-3xl mb-2 opacity-50"></i><p>No active orders</p></div>`;
        return;
    }

    container.innerHTML = activeOrders.map(order => {
        const elapsedSeconds = Math.floor((Date.now() - order.createdAt) / 1000);
        const remainingSeconds = Math.max(0, 1500 - elapsedSeconds);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const operatorName = order.operator || `Partner ${order.operatorId || 'ID'}`;
        const hasOtp = order.otp !== null && order.otp !== undefined;
        
        const otpHistory = order.otpHistory || [];
        otpHistory.sort((a, b) => b.timestamp - a.timestamp);
        
        const latestOtp = otpHistory.length > 0 ? otpHistory[0].otp : null;
        const previousOtps = otpHistory.slice(1);
        
        let otpHistoryHtml = '';
        
        if (latestOtp) {
            otpHistoryHtml += `
                <div class="mt-3 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-center border border-green-200 dark:border-green-800">
                    <div class="text-xs text-green-600 dark:text-green-400 mb-1">📱 OTP BARU</div>
                    <div class="font-mono text-xl font-bold tracking-widest text-green-700 dark:text-green-300">${latestOtp}</div>
                    <button onclick="copyToClipboard('${latestOtp}')" class="mt-1 text-xs text-green-500 hover:text-green-700"><i class="fas fa-copy"></i> Copy</button>
                </div>
            `;
        }
        
        if (previousOtps.length > 0) {
            otpHistoryHtml += `<div class="mt-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">Previous OTPs:</div>`;
            previousOtps.forEach(otpItem => {
                otpHistoryHtml += `
                    <div class="mt-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex justify-between items-center">
                        <div class="font-mono text-sm font-bold text-gray-600 dark:text-gray-300">${otpItem.otp}</div>
                        <button onclick="copyToClipboard('${otpItem.otp}')" class="text-xs text-blue-500 hover:text-blue-700"><i class="fas fa-copy"></i> Copy</button>
                    </div>
                `;
            });
        }
        
        if (!latestOtp && !hasOtp) {
            otpHistoryHtml = `<div class="mt-2 text-xs text-gray-400"><i class="fas fa-spinner fa-pulse"></i> Waiting message...</div>`;
        }

        let actionButtons = '';
        if (hasOtp || latestOtp) {
            actionButtons = `
                <button onclick="receiveAnotherSms('${order.activationId}')" class="text-xs px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50">Receive Another SMS</button>
                <button onclick="completeOrder('${order.activationId}')" class="text-xs px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50">Complete</button>
            `;
        } else {
            actionButtons = `
                <button onclick="cancelOrder('${order.activationId}')" class="text-xs px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50">Cancel</button>
            `;
        }

        return `
            <div class="order-item">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Operator</div>
                        <div class="font-medium text-slate-700 dark:text-white">${escapeHtml(operatorName)}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-500 dark:text-gray-400">Price</div>
                        <div class="font-semibold text-green-600 dark:text-green-400">${formatPrice(order.price)}</div>
                        <div class="text-xs text-gray-400 timer-display" data-created="${order.createdAt}" data-id="${order.activationId}">${timerDisplay}</div>
                    </div>
                </div>
                
                <div class="copy-card p-3 mb-3 cursor-pointer border rounded-lg" onclick="copyToClipboard('${order.numberWithoutCode}')">
                    <div class="text-xs text-gray-400 mb-1">Nomor tanpa kode negara</div>
                    <div class="font-mono text-xl font-bold text-white">${order.numberWithoutCode}</div>
                    <div class="text-xs text-blue-400 mt-1"><i class="fas fa-copy"></i> Klik untuk copy</div>
                </div>
                
                <div class="copy-card p-3 mb-3 cursor-pointer border rounded-lg" onclick="copyToClipboard('${order.numberWithCode}')">
                    <div class="text-xs text-gray-400 mb-1">Nomor dengan kode negara</div>
                    <div class="font-mono text-xl font-bold text-white">${order.numberWithCode}</div>
                    <div class="text-xs text-blue-400 mt-1"><i class="fas fa-copy"></i> Klik untuk copy</div>
                </div>
                
                ${otpHistoryHtml}
                
                <div class="flex gap-2 mt-3">
                    ${actionButtons}
                </div>
            </div>
        `;
    }).join('');
    
    startAllTimers();
}

// Helper function untuk menghindari XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========================
// FILTER HANDLERS
// ========================
function setupFilters() {
    const filters = document.querySelectorAll('.filter-chip');
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            currentRankFilter = filter.dataset.rank;
            renderPriceList();
        });
    });
}

// ========================
// SET DARK MODE PERMANEN
// ========================
function setDarkMode() {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
}

// ========================
// INIT
// ========================
document.addEventListener('DOMContentLoaded', () => {
    setDarkMode(); // Dark mode permanen
    checkBalance();
    loadDanaPrices();
    setupFilters();
    loadOrdersFromLocalStorage();
    setInterval(checkBalance, 30000);
});

// Expose functions
window.cancelOrder = cancelOrder;
window.receiveAnotherSms = receiveAnotherSms;
window.completeOrder = completeOrder;
window.copyToClipboard = copyToClipboard;