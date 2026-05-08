// 1. Инициализация Telegram
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

let totalSum = 0;

// Конфиг вебхуков
const N8N_WEBHOOK_URL = 'https://tiktiok.xyz/webhook/4f86d599-fee4-49a4-8fb6-69fd6738cefe';

// Массив с 10 тестовыми товарами
const mockProducts = [
    { "ID": "1", "Название": "Троянда Explorer", "Цена": "120 ₴", "Кол - во": 50, "Категория": "Квіти", "Статус": "active", "Описание": "Класична червона троянда з великим бутоном.", "Фото": "https://images.unsplash.com/photo-1548849170-362584851722?q=80&w=400&auto=format&fit=crop" },
    { "ID": "2", "Название": "Букет 'Ніжність'", "Цена": "1500 ₴", "Кол - во": 10, "Категория": "Букети", "Статус": "active", "Описание": "Мікс півоній та евкаліпту в крафтовій обгортці.", "Фото": "https://images.unsplash.com/photo-1561100151-64538c98404a?q=80&w=400&auto=format&fit=crop" },
    { "ID": "3", "Название": "Ваза 'Антик'", "Цена": "850 ₴", "Кол - во": 5, "Категория": "Декор", "Статус": "active", "Описание": "Керамічна ваза ручної роботи для сухоцвітів.", "Фото": "https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=400&auto=format&fit=crop" },
    { "ID": "4", "Название": "Біла Лілія", "Цена": "180 ₴", "Кол - во": 25, "Категория": "Квіти", "Статус": "active", "Описание": "Елегантна лілія з тонким ароматом.", "Фото": "https://images.unsplash.com/photo-1508610048659-a06b669e3321?q=80&w=400&auto=format&fit=crop" },
    { "ID": "5", "Название": "Букет 'Марсель'", "Цена": "2100 ₴", "Кол - во": 3, "Категория": "Букети", "Статус": "active", "Описание": "Авторський букет з гортензіями та трояндами.", "Фото": "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=400&auto=format&fit=crop" },
    { "ID": "6", "Название": "Аромасвічка 'Rose'", "Цена": "400 ₴", "Кол - во": 15, "Категория": "Декор", "Статус": "active", "Описание": "Свічка з натурального воску з ароматом саду.", "Фото": "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=400&auto=format&fit=crop" },
    { "ID": "7", "Название": "Тюльпан Strong Gold", "Цена": "65 ₴", "Кол - во": 100, "Категория": "Квіти", "Статус": "active", "Описание": "Яскраво-жовтий голландський тюльпан.", "Фото": "https://images.unsplash.com/photo-1520323232435-5882ad34f7ae?q=80&w=400&auto=format&fit=crop" },
    { "ID": "8", "Название": "Кошик 'Сонце'", "Цена": "3200 ₴", "Кол - во": 2, "Категория": "Букети", "Статус": "active", "Описание": "Велика подарункова корзина з соняшниками.", "Фото": "https://images.unsplash.com/photo-1596003906949-67221c37965c?q=80&w=400&auto=format&fit=crop" },
    { "ID": "9", "Название": "Подарунковий бокс", "Цена": "1200 ₴", "Кол - во": 7, "Категория": "Декор", "Статус": "active", "Описание": "Набір: листівка, декор та міні-букет.", "Фото": "https://images.unsplash.com/photo-1549462229-4d9ce916327b?q=80&w=400&auto=format&fit=crop" },
    { "ID": "10", "Название": "Евкаліпт (гілка)", "Цена": "95 ₴", "Кол - во": 40, "Категория": "Квіти", "Статус": "active", "Описание": "Свіжий евкаліпт для доповнення інтер'єру.", "Фото": "https://images.unsplash.com/photo-1545641203-7d072a14e3b9?q=80&w=400&auto=format&fit=crop" }
];

// 2. ПОИСК ЦВЕТОВ В ПОИСКОВОЙ ЛЕНТЕ
function handleSearch() {
    const query = document.getElementById('product-search').value.toLowerCase();
    
    if (typeof allProducts === 'undefined') return;

    const filtered = allProducts.filter(item => {
        const name = String(item['Название'] || item['name'] || '').toLowerCase();
        const desc = String(item['Описание'] || '').toLowerCase();
        return name.includes(query) || desc.includes(query);
    });

    showFiltered(filtered);
}

// 3. ФУНКЦИЯ ФИЛЬТРАЦИИ КАТЕГОРИЙ
function filterProducts(category, btn) {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const titleElement = document.getElementById('current-category-title');
    if (titleElement) {
        titleElement.innerText = category === 'Все' ? 'Всі товари' : category;
    }

    if (category === 'Все') {
        showFiltered(window.allProducts);
    } else {
        const filtered = window.allProducts.filter(item => {
            const itemCat = (item['Категория'] || item['category'] || '').toString().trim();
            return itemCat === category;
        });
        showFiltered(filtered);
    }
}

// 4. ЗАГРУЗКА ДАННЫХ
async function loadStore() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.className = 'product-grid';
    container.innerHTML = `<div style="grid-column: 1/-1; padding: 100px 20px; text-align: center; color: #CBA35C;">Loading Boutique...</div>`;

    try {
        const response = await fetch(N8N_WEBHOOK_URL);
        const data = await response.json();
        
        console.log("Данные из n8n:", data);
        
        const serverData = Array.isArray(data) ? data : (data.products ? data.products : [data]);
        
        // Используем серверные данные, если они есть, иначе — тестовые
        window.allProducts = serverData.length > 0 ? serverData : mockProducts;
        
        if (window.allProducts.length > 0) {
            showFiltered(window.allProducts);
        } else {
            container.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: #666;">Колекція оновлюється</p>';
        }
    } catch (error) {
        console.error('Ошибка загрузки, загружаем моки:', error);
        window.allProducts = mockProducts;
        showFiltered(window.allProducts);
    }
}

// 5. ОТРИСОВКА КАРТОЧЕК
function showFiltered(items) {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = ''; 

    items.forEach(item => {
        const title = (item['Название'] || item['name'] || '').toString().trim();
        const rawStatus = (item['Статус'] || item['status'] || '').toString().trim();
        
        if (!title || rawStatus.toLowerCase() !== 'active') return;

        let rawStock = item['Кол - во'] || item['Кол-во'] || item['Количество'] || 0;
        const stock = parseInt(String(rawStock).replace(/\D/g, '')) || 0;

        const id = item['ID'] || item['id'] || `id-${Math.random().toString(36).substr(2, 9)}`;
        const price = parseInt(String(item['Цена'] || item['price'] || '0').replace(/\D/g, '')) || 0;
        const img = item['Фото'] || item['photo'] || '';
        
        const description = (item['Описание'] || item['description'] || 'Преміальний букет для особливих моментів.').toString().trim();
        
        const cleanTitle = title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const cleanDesc = description.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\r?\n|\r/g, " ");

        container.innerHTML += `
            <div class="product-card" data-id="${id}" data-stock="${stock}">
                <div class="product-image-container">
                    ${img ? `<img src="${img}" class="product-image" alt="${cleanTitle}">` : '🌸'}
                </div>
                <div class="product-info" style="text-align: center; display: flex; flex-direction: column; align-items: center;">
                    <h3 class="product-title">${title}</h3>
                    <p class="product-description">${description}</p>
                    <p class="product-price" style="color: #CBA35C; font-weight: bold; margin: 5px 0;">${price} ₴</p>
                    <p class="product-stock" style="color: #888; font-size: 13px; margin: 8px 0; text-align: center; width: 100%;">
                        Залишилося: <b style="color:#CBA35C">${stock}</b> шт.
                    </p>
                    <button class="details-btn" onclick="openProductDetails('${id}', '${cleanTitle}', '${img}', '${cleanDesc}', ${price})">ДОКЛАДНІШЕ</button>
                    <div class="buy-section" style="margin-top: 10px; width: 100%;">
                        ${stock > 0 ? `
                            <button class="buy-btn" onclick="showCounter(this)">ДОДАТИ</button>
                            <div class="counter-container" style="display: none; justify-content: center; align-items: center; gap: 12px;">
                                <button class="count-btn" onclick="changeCount(this, -1)">-</button>
                                <span class="count-value">1</span>
                                <button class="count-btn" onclick="changeCount(this, 1)">+</button>
                            </div>
                        ` : `
                            <div style="background: #1a1a1a; color: #555; padding: 12px; border-radius: 8px; font-size: 14px; border: 1px solid #333;">
                                Немає в наявності 🌸
                            </div>
                        `}
                    </div>
                </div>
            </div>`;
    });
}

// 6. МОДАЛКА ПОДРОБНОСТЕЙ
function openProductDetails(id, title, img, desc, price) {
    const fab = document.querySelector('.floric-fab');
    if (fab) fab.style.display = 'none';

    let detailsModal = document.getElementById('details-modal');
    if (!detailsModal) {
        detailsModal = document.createElement('div');
        detailsModal.id = 'details-modal';
        detailsModal.className = 'cart-overlay';
        document.body.appendChild(detailsModal);
    }
    detailsModal.innerHTML = `
        <div class="cart-container details-container">
            <button class="close-details" onclick="closeDetails()">✕</button>
            <div class="details-img-wrapper"><img src="${img}" class="product-image"></div>
            <h2 style="color:#CBA35C; text-transform: uppercase; font-size: 20px;">${title}</h2>
            <p style="color:#888; font-size: 14px; margin: 15px 0;">${desc}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; border-top: 1px solid #222; padding-top: 20px;">
                <span style="font-size:24px; color:#CBA35C; font-weight:700;">${price} ₴</span>
                <button class="checkout-btn" style="width:auto; padding: 12px 30px; margin:0;" onclick="addToCartFromDetails('${id}');">Додати</button>
            </div>
        </div>`;
    detailsModal.style.display = 'flex';
    setTimeout(() => detailsModal.classList.add('active'), 10);
}

function closeDetails() {
    const detailsModal = document.getElementById('details-modal');
    if (detailsModal) {
        detailsModal.classList.remove('active');
        setTimeout(() => { detailsModal.style.display = 'none'; }, 300);
    }
    const fab = document.querySelector('.floric-fab');
    if (fab) fab.style.display = 'flex';
}

function addToCartFromDetails(id) {
    const card = document.querySelector(`.product-card[data-id="${id}"]`);
    if (card) {
        const buyBtn = card.querySelector('.buy-btn');
        if (buyBtn && buyBtn.style.display !== 'none') {
            showCounter(buyBtn);
        } else {
            const plusBtn = card.querySelector('.count-btn:last-child');
            if (plusBtn) changeCount(plusBtn, 1);
        }
        closeDetails();
    }
}

// 7. ЛОГИКА СЧЕТЧИКОВ
function showCounter(btn) {
    const card = btn.closest('.product-card');
    const counter = card.querySelector('.counter-container');
    btn.style.display = 'none';
    counter.style.display = 'flex'; 
    card.querySelector('.count-value').innerText = 1;
    updateTotal();
}

function changeCount(btn, delta) {
    const card = btn.closest('.product-card');
    const countDisplay = card.querySelector('.count-value');
    const stockLimit = parseInt(card.getAttribute('data-stock')) || 0;
    
    let currentCount = parseInt(countDisplay.innerText) || 1;

    if (delta > 0 && currentCount >= stockLimit) {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert(`Вибач! В наявності лише ${stockLimit} шт. 🌸`);
        } else {
            alert(`В наявності лише ${stockLimit} шт.`);
        }
        return;
    }

    let newCount = currentCount + delta;
    
    if (newCount <= 0) {
        card.querySelector('.counter-container').style.display = 'none';
        card.querySelector('.buy-btn').style.display = 'block';
        countDisplay.innerText = 1;
    } else {
        countDisplay.innerText = newCount;
    }

    updateTotal();
    
    if (document.getElementById('cart-modal')?.style.display === 'flex') {
        renderCartItems();
    }
}

function updateTotal() {
    const fab = document.getElementById('cart-fab');
    const fabCount = document.getElementById('fab-count');
    const totalContainer = document.getElementById('cart-total-value');
    let tempTotal = 0, totalItemsCount = 0;
    
    document.querySelectorAll('.product-card').forEach(card => {
        const counter = card.querySelector('.counter-container');
        if (counter && counter.style.display === 'flex') {
            const price = parseInt(card.querySelector('.product-price').innerText.replace(/\D/g, '')) || 0;
            const count = parseInt(card.querySelector('.count-value').innerText) || 0;
            tempTotal += (price * count);
            totalItemsCount += count;
        }
    });
    totalSum = tempTotal;
    if (fab) {
        fab.style.display = totalItemsCount > 0 ? 'flex' : 'none';
        if (fabCount) fabCount.innerText = totalItemsCount;
    }
    if (totalContainer) totalContainer.innerText = `${totalSum} ₴`;
}

// 8. КОРЗИНА
function openCart() {
    const fab = document.querySelector('.floric-fab');
    if (fab) fab.style.display = 'none';

    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    document.getElementById('cart-stage-1').style.display = 'block';
    document.getElementById('cart-stage-2').style.display = 'none';
    renderCartItems();
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
    const fab = document.querySelector('.floric-fab');
    if (fab) fab.style.display = 'flex';
}

function renderCartItems() {
    const list = document.getElementById('cart-items-list');
    if (!list) return;
    list.innerHTML = ''; 
    let hasItems = false;

    document.querySelectorAll('.product-card').forEach(card => {
        const counter = card.querySelector('.counter-container');
        if (counter && counter.style.display === 'flex') {
            const id = card.getAttribute('data-id');
            const title = card.querySelector('.product-title').innerText.trim();
            const price = card.querySelector('.product-price').innerText;
            const count = card.querySelector('.count-value').innerText;
            const img = card.querySelector('.product-image')?.src || '';
            hasItems = true;

            list.innerHTML += `
                <div class="cart-item-row" id="cart-item-render-${id}">
                    <div class="cart-item-info">
                        <img src="${img}" class="cart-item-mini-img" onerror="this.src='🌸'">
                        <div class="cart-item-text">
                            <span class="cart-item-title">${title}</span>
                            <div class="cart-item-controls">
                                <button class="qty-btn" onclick="changeQtyInCart('${id}', -1)">-</button>
                                <span class="qty-value">${count} шт.</span>
                                <button class="qty-btn" onclick="changeQtyInCart('${id}', 1)">+</button>
                                <span class="cart-item-price">x ${price}</span>
                            </div>
                        </div>
                    </div>
                    <button class="remove-item-btn" onclick="animateRemove('${id}')">✕</button>
                </div>`;
        }
    });
    if (!hasItems) closeCart();
}

function changeQtyInCart(id, delta) {
    const card = document.querySelector(`.product-card[data-id="${id}"]`);
    if (card) {
        const btn = delta > 0 ? card.querySelector('.count-btn:last-child') : card.querySelector('.count-btn:first-child');
        changeCount(btn, delta);
    }
}

function animateRemove(id) {
    const element = document.getElementById(`cart-item-render-${id}`);
    if (element) {
        element.classList.add('cart-item-fade-out'); 
        setTimeout(() => {
            deleteProductById(id);
        }, 550); 
    }
}

function deleteProductById(id) {
    const card = document.querySelector(`.product-card[data-id="${id}"]`);
    if (card) {
        card.querySelector('.counter-container').style.display = 'none';
        card.querySelector('.buy-btn').style.display = 'block';
        card.querySelector('.count-value').innerText = 1;
    }
    updateTotal();
    renderCartItems();
}

// 9. ОФОРМЛЕНИЕ ЗАКАЗА
function goToCheckout() {
    if (totalSum <= 0) return;
    document.getElementById('cart-stage-1').style.display = 'none';
    document.getElementById('cart-stage-2').style.display = 'block';
}

function backToCart() {
    document.getElementById('cart-stage-2').style.display = 'none';
    document.getElementById('cart-stage-1').style.display = 'block';
}

function showSuccessOrder() {
    const cartModal = document.getElementById('cart-modal');

    if (cartModal) {
        cartModal.style.display = 'none';
        cartModal.classList.remove('active');
    }

    let overlay = document.getElementById('success-overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'success-overlay';
        document.body.appendChild(overlay);
    }

    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(249, 228, 237, 0.75);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
    `;

    overlay.innerHTML = `
        <div style="
            background: #FFFFFF;
            padding: 40px 24px;
            border-radius: 30px;
            border: 2px solid #F28EB3;
            text-align: center;
            max-width: 340px;
            width: 100%;
            box-shadow: 0 20px 50px rgba(217,108,148,0.20);
            animation: popupShow 0.4s ease;
        ">

            <div style="
                font-size: 58px;
                margin-bottom: 18px;
            ">
                ✨
            </div>

            <h2 style="
                color: #9C5369;
                font-size: 25px;
                margin-bottom: 14px;
                text-transform: uppercase;
                font-weight: 800;
                line-height: 1.3;
            ">
                Дякуємо за вибір!
            </h2>

            <p style="
                color: #333333;
                margin-bottom: 30px;
                line-height: 1.7;
                font-size: 16px;
                font-weight: 500;
            ">
                Ваше замовлення прийнято.
                Флорист вже почав створювати
                ваш ідеальний букет 🌸
            </p>

            <button 
                onclick="location.reload()"
                style="
                    background: linear-gradient(135deg, #F28EB3, #D96C94);
                    color: #FFFFFF;
                    border: none;
                    padding: 16px;
                    border-radius: 16px;
                    font-weight: 700;
                    width: 100%;
                    cursor: pointer;
                    font-size: 16px;
                    transition: 0.3s;
                    box-shadow: 0 10px 25px rgba(217,108,148,0.25);
                "
            >
                Зрозуміло
            </button>

        </div>

        <style>
            @keyframes popupShow {
                from {
                    opacity: 0;
                    transform: translateY(30px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        </style>
    `;
}

async function finalCheckout() {
    const nameInput = document.getElementById('customer-name').value.trim();
    const phoneInput = document.getElementById('customer-phone').value.trim();
    
    const ADMIN_WEBHOOK = 'https://tiktiok.xyz/webhook/4da37afc-37ca-4ea3-9fe0-ffb287465212';
    const STOCK_WEBHOOK = 'https://tiktiok.xyz/webhook/c1a37c52-a21a-4631-a3fa-96ae2e01468b';

    if (!nameInput || !phoneInput) {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert("Будь ласка, введіть ім'я та номер телефону 🌸");
        } else {
            alert("Будь ласка, введіть ім'я та номер телефону 🌸");
        }
        return;
    }

    const orderItems = [];
    let calculatedTotal = 0;

    document.querySelectorAll('.product-card').forEach(card => {
        const counter = card.querySelector('.counter-container');
        if (counter && counter.style.display === 'flex') {
            const title = card.querySelector('.product-title').innerText.trim();
            const count = parseInt(card.querySelector('.count-value').innerText) || 0;
            const pricePerUnit = parseInt(card.querySelector('.product-price').innerText.replace(/\D/g, '')) || 0;

            if (count > 0) {
                calculatedTotal += (pricePerUnit * count);
                orderItems.push({
                    id: card.getAttribute('data-id'),
                    name: title,
                    count: count,
                    price: pricePerUnit
                });
            }
        }
    });

    if (orderItems.length === 0) {
        alert("Кошик порожній 🌸");
        return;
    }

    const orderData = {
        customer_name: nameInput,
        customer_phone: phoneInput,
        order_list: orderItems.map(i => `${i.name} (${i.count} шт)`).join(', '),
        details: orderItems,
        total_sum: calculatedTotal + " ₴",
        tg_user_id: tg.initDataUnsafe?.user?.id || 'unknown',
        timestamp: new Date().toLocaleString('uk-UA')
    };

    const finalBtn = document.querySelector('.final-btn');
    if (finalBtn) {
        finalBtn.disabled = true;
        finalBtn.innerText = "Відправка...";
    }

    try {
        const [adminRes, stockRes] = await Promise.all([
            fetch(ADMIN_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            }),
            fetch(STOCK_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })
        ]);

        if (adminRes.ok && stockRes.ok) {
            showSuccessOrder();
        } else {
            throw new Error('Ошибка сервера');
        }

    } catch (e) {
        console.error('Ошибка при отправке заказа:', e);
        alert("Помилка зв'язку. Перевірте інтернет та спробуйте ще раз 🌸");
        if (finalBtn) {
            finalBtn.disabled = false;
            finalBtn.innerText = "Замовити";
        }
    }
}

// 10. АНИМАЦИЯ ПУЛЬСИРУЮЩЕЙ КНОПКИ (ЧАТ)
function startChatPulse() {
    const fab = document.querySelector('.floric-fab');
    if (!fab) return;

    function toggleFab() {
        fab.classList.add('visible');
        setTimeout(() => {
            fab.classList.remove('visible');
            const menu = document.getElementById('contact-menu');
            if (menu) menu.style.display = 'none'; 
        }, 20000);
    }

    toggleFab();
    setInterval(toggleFab, 60000);
}

document.addEventListener('DOMContentLoaded', startChatPulse);

// 11. ВСПОМОГАТЕЛЬНОЕ
function toggleWishlist(productId, btnElement) {
    let favorites = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
        btnElement.classList.remove('active');
    } else {
        favorites.push(productId);
        btnElement.classList.add('active');
        if (window.navigator.vibrate) window.navigator.vibrate(20);
    }
    localStorage.setItem('wishlist', JSON.stringify(favorites));
}

function toggleContactMenu() {
    const menu = document.getElementById('contact-menu');
    menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
}

window.addEventListener('click', function(e) {
    const menu = document.getElementById('contact-menu');
    const fab = document.querySelector('.floric-fab');
    if (menu && !menu.contains(e.target) && fab && !fab.contains(e.target)) {
        menu.style.display = 'none';
    }
    if (e.target.id === 'cart-modal' || e.target.id === 'details-modal') {
        closeCart();
        closeDetails();
    }
});

window.onload = loadStore;