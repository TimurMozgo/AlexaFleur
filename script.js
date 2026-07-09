// 1. Инициализация Telegram
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

let totalSum = 0;
// 1. Словарь переводов интерфейса
const translations = {
    UA: {
        search_placeholder: "Пошук квітів...",
        cat_all: "Всі",
        cat_flowers: "Квіти",
        cat_bouquets: "Букети",
        cat_decor: "Декор",
        all_products_title: "Всі товари",
        cart_header: "Кошик",
        cart_total: "Разом: ",
        checkout_btn: "Далі (Оформити)",
        delivery_details: "Деталі доставки:",
        name_placeholder: "Ваше ім'я",
        phone_placeholder: "Номер телефону",
        back_btn: "Назад",
        order_btn: "Замовити",
        fab_chat: "ЧАТ",
        chat_with_florist: "Чат з флористом",
        call_btn: "Зателефонувати",
        ai_assistant_header: "AlexaFleur | АІ Асистент",
        ai_input_placeholder: "Напишіть нам...",
        
        // 🔥 ВОТ ОНИ, РАСКОММЕНТИРОВАННЫЕ АДРЕСА:
        addr_diivska: "м. Дніпро, вул. Велика Діївська 111к (біля метро)",
        addr_parusny: "м. Дніпро, провулок Парусний, 7Д",
        welcome_title: "Оберіть магазин для перегляду наявності букетів:"
    },
    RU: {
        search_placeholder: "Поиск цветов...",
        cat_all: "Все",
        cat_flowers: "Цветы",
        cat_bouquets: "Букеты",
        cat_decor: "Декор",
        all_products_title: "Все товары",
        cart_header: "Корзина",
        cart_total: "Итого: ",
        checkout_btn: "Далее (Оформить)",
        delivery_details: "Детали доставки:",
        name_placeholder: "Ваше имя",
        phone_placeholder: "Номер телефона",
        back_btn: "Назад",
        order_btn: "Заказать",
        fab_chat: "ЧАТ",
        chat_with_florist: "Чат с флористом",
        call_btn: "Позвонить",
        ai_assistant_header: "AlexaFleur | AI Ассистент",
        ai_input_placeholder: "Напишите нам...",
        
        // 🔥 И ЗДЕСЬ ТОЖЕ УБРАЛИ КОММЕНТАРИИ:
        addr_diivska: "г. Днепр, ул. Большая Диевская 111к (возле метро)",
        addr_parusny: "г. Днепр, переулок Парусный, 7Д",
        welcome_title: "Выберите магазин для просмотра наличия букетов:"
    }
};

// 2. Инициализация языка
let currentLang = localStorage.getItem('store_lang') || 'UA';


let currentAddress = localStorage.getItem('store_address') || null;

let currentCategory = 'Все';


// 3. Функция обновления текстов на странице
function updateInterface() {
    // Переводим обычный текст с атрибутом data-translate
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLang][key]) {
            element.innerHTML = translations[currentLang][key];
        }
    });

    // Переводим плейсхолдеры внутри инпутов
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        if (translations[currentLang][key]) {
            element.setAttribute('placeholder', translations[currentLang][key]);
        }
    });
}

// 4. Функция переключения языка для двойного тоггла
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('store_lang', currentLang); // сохраняем выбор
    
    updateInterface();
    
    // Переключаем активный класс на кнопках переключателя в хэдере
    document.querySelectorAll('.lang-toggle-btn').forEach(btn => btn.classList.remove('active'));
    
    if (currentLang === 'UA') {
        const btnUa = document.getElementById('btn-ua');
        if (btnUa) btnUa.classList.add('active');
    } else {
        const btnRu = document.getElementById('btn-ru');
        if (btnRu) btnRu.classList.add('active');
    }

    if (window.allProducts) { showFiltered(window.allProducts); }
}

// 5. Кастомный выпадающий список: Полностью доверяем плавность CSS
function toggleAddressDropdown() {
    const selectEl = document.getElementById('custom-address-select');
    if (!selectEl) return;
    selectEl.classList.toggle('open'); 
}

// 6. Функция обработки выбора адреса (и для Welcome-окна, и для хэдера)
function selectAddress(addressValue) {
    currentAddress = addressValue;
    localStorage.setItem('store_address', currentAddress);
    
    const triggerText = document.getElementById('selected-address-text');
    if (triggerText) {
        triggerText.setAttribute('data-translate', addressValue === 'Диевская' ? 'addr_diivska' : 'addr_parusny');
        triggerText.innerHTML = translations[currentLang][triggerText.getAttribute('data-translate')];
    }
    
    updateAddressHighlight();
    
    const selectEl = document.getElementById('custom-address-select');
    if (selectEl) {
        selectEl.classList.remove('open');
    }
    
    // 🔥 ИСПРАВЛЕНО ЗДЕСЬ: Перерисовываем витрину правильной функцией
    if (window.allProducts) { 
        showFiltered(window.allProducts); 
    }
}

// 7. Логика для ПЕРВОГО выбора на стартовом Welcome-экране
function selectInitialAddress(addressValue) {
    const welcomeModal = document.getElementById('welcome-modal');
    if (welcomeModal) welcomeModal.style.display = 'none';
    selectAddress(addressValue);
}

// 8. Подсветка выбранного пункта (.selected) в кастомном списке
function updateAddressHighlight() {
    const optDiivska = document.getElementById('opt-diivska');
    const optParusny = document.getElementById('opt-parusny');
    
    if (optDiivska) optDiivska.classList.remove('selected');
    if (optParusny) optParusny.classList.remove('selected');
    
    if (currentAddress === 'Диевская' && optDiivska) {
        optDiivska.classList.add('selected');
    } else if (currentAddress === 'Парусный' && optParusny) {
        optParusny.classList.add('selected');
    }
}

// 9. Закрытие кастомного селекта, если кликнули в пустую область экрана
window.addEventListener('click', function(e) {
    const select = document.getElementById('custom-address-select');
    if (select && !select.contains(e.target)) {
        select.classList.remove('open');
    }
});

// 10. Запуск при полной загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    updateInterface();
    
    // Подсвечиваем сохраненный язык в тоггле хэдера
    document.querySelectorAll('.lang-toggle-btn').forEach(btn => btn.classList.remove('active'));
    if (currentLang === 'UA') {
        const btnUa = document.getElementById('btn-ua');
        if (btnUa) btnUa.classList.add('active');
    } else {
        const btnRu = document.getElementById('btn-ru');
        if (btnRu) btnRu.classList.add('active');
    }

    if (!currentAddress) {
        const welcomeModal = document.getElementById('welcome-modal');
        if (welcomeModal) welcomeModal.style.display = 'flex';
    } else {
        const triggerText = document.getElementById('selected-address-text');
        if (triggerText) {
            triggerText.setAttribute('data-translate', currentAddress === 'Диевская' ? 'addr_diivska' : 'addr_parusny');
            triggerText.innerHTML = translations[currentLang][triggerText.getAttribute('data-translate')];
        }
        updateAddressHighlight();
        
        // 🔥 ИСПРАВЛЕНО ЗДЕСЬ
        if (window.allProducts) { showFiltered(window.allProducts); }
    }
});

// Конфиг вебхуков
const N8N_WEBHOOK_URL = 'https://tiktiok.xyz/webhook/4f86d599-fee4-49a4-8fb6-69fd6738cefe';

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
function filterProducts(category, buttonElement) {
    // 1. Переключаем активный класс на кнопках
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    if (buttonElement) buttonElement.classList.add('active');

    // 2. Обновляем заголовок через наш словарь translations
    const titleElement = document.getElementById('current-category-title');
    if (titleElement) {
        if (category === 'Все') titleElement.setAttribute('data-translate', 'all_products_title');
        else if (category === 'Квіти') titleElement.setAttribute('data-translate', 'cat_flowers');
        else if (category === 'Букети') titleElement.setAttribute('data-translate', 'cat_bouquets');
        else if (category === 'Декор') titleElement.setAttribute('data-translate', 'cat_decor');

        const key = titleElement.getAttribute('data-translate');
        if (translations[currentLang] && translations[currentLang][key]) {
            titleElement.innerHTML = translations[currentLang][key];
        }
    }

    // 3. СОХРАНЯЕМ КАТЕГОРИЮ И ЗАПУСКАЕМ ПЕРЕРИСОВКУ
    currentCategory = category;
    if (window.allProducts) {
        showFiltered(window.allProducts);
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

    const activeCategory = typeof currentCategory !== 'undefined' ? currentCategory : 'Все';

    items.forEach(item => {
        const title = (item['Название'] || item['name'] || '').toString().trim();
        const rawStatus = (item['Статус'] || item['status'] || '').toString().trim();
        const itemAddress = (item['Адрес'] || item['address'] || '').toString().trim();
        const itemCategory = (item['Категория'] || item['category'] || '').toString().trim();
        
        if (!title || rawStatus.toLowerCase() !== 'active') return;

        // Фильтры
        if (typeof currentAddress !== 'undefined' && currentAddress && currentAddress !== 'undefined') {
            const cleanCurrent = currentAddress.toLowerCase().trim();
            const cleanItem = itemAddress.toLowerCase().trim();
            if (!cleanItem.includes(cleanCurrent) && !cleanCurrent.includes(cleanItem)) return;
        }

        if (activeCategory !== 'Все' && itemCategory !== activeCategory) return;

        let rawStock = item['Кол - во'] || item['Кол-во'] || item['Количество'] || 0;
        const stock = parseInt(String(rawStock).replace(/\D/g, '')) || 0;
        const id = item['row_number'] || item['rowNumber'] || `row-${Math.random().toString(36).substr(2, 5)}`;
        const price = parseInt(String(item['Цена'] || item['price'] || '0').replace(/\D/g, '')) || 0;
        const img = item['Фото'] || item['photo'] || '';
        const description = (item['Описание'] || item['description'] || 'Преміальний букет для особливих моментів.').toString().trim();
        
        const cleanTitle = title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const cleanDesc = description.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\r?\n|\r/g, " ");

        // Отрисовка
        container.innerHTML += `
        <div class="product-card" data-id="${id}" data-stock="${stock}">
            <div class="product-image-container">
                ${img ? `<img src="${img}" class="product-image" alt="${cleanTitle}">` : '<div class="no-img">🌸</div>'}
            </div>
            <div class="product-info">
                <h3 class="product-title">${title}</h3>
                <p class="product-description">${description}</p>
                <div class="product-meta">
                    <p class="product-price">${price} ₴</p>
                    <p class="product-stock">Залишилося: <b>${stock}</b> шт.</p>
                </div>
                <div class="product-actions">
                    <button class="details-btn" onclick="openProductDetails('${id}', '${cleanTitle}', '${img}', '${cleanDesc}', ${price})">Детальніше</button>
                    ${stock > 0 ? `
                        <button class="buy-btn" onclick="showCounter(this)">Додати</button>
                        <div class="counter-container">
                            <button class="count-btn" onclick="changeCount(this, -1)">-</button>
                            <span class="count-value">1</span>
                            <button class="count-btn" onclick="changeCount(this, 1)">+</button>
                        </div>
                    ` : `<div class="out-of-stock">Немає в наявності</div>`}
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

    // Используем конструктор элементов или просто экранируем данные, 
    // чтобы кавычки не ломали верстку
    const safeTitle = title.replace(/"/g, '&quot;').replace(/'/g, "\\'");
    
    detailsModal.innerHTML = `
        <div class="cart-container details-container">
            <button class="close-details" onclick="closeDetails()">✕</button>
            <div class="details-img-wrapper"><img src="${img}" class="product-image" alt="Букет"></div>
            <h2 style="color:#CBA35C; text-transform: uppercase; font-size: 20px;">${title}</h2>
            <p style="color:#888; font-size: 14px; margin: 15px 0;">${desc}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; border-top: 1px solid #222; padding-top: 20px;">
                <span style="font-size:24px; color:#CBA35C; font-weight:700;">${price} ₴</span>
                <button class="checkout-btn" 
                        style="width:auto; padding: 12px 30px; margin:0;" 
                        onclick="addToCartFromDetails('${id}')">
                    Додати
                </button>
            </div>
        </div>`;

    detailsModal.style.display = 'flex';
    // Добавляем микро-задержку для CSS-анимации
    requestAnimationFrame(() => detailsModal.classList.add('active'));
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
        background: rgba(219, 200, 159, 0.4); /* Мягкий кремово-золотой фон overlay */
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
            border: 2px solid #DBC89F; /* Граница в цвет основного акцента */
            text-align: center;
            max-width: 340px;
            width: 100%;
            box-shadow: 0 20px 50px rgba(184, 162, 117, 0.15); /* Золотистая тень */
            animation: popupShow 0.4s ease;
        ">

            <div style="
                font-size: 58px;
                margin-bottom: 18px;
            ">
                ✨
            </div>

            <h2 style="
                color: #b8a275; /* Текст в цвет темного акцента */
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
                    background: linear-gradient(135deg, #DBC89F, #b8a275); /* Благородный золотой градиент */
                    color: #FFFFFF;
                    border: none;
                    padding: 16px;
                    border-radius: 16px;
                    font-weight: 700;
                    width: 100%;
                    cursor: pointer;
                    font-size: 16px;
                    transition: 0.3s;
                    box-shadow: 0 10px 25px rgba(184, 162, 117, 0.3);
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

let initGardenData;
let updateFlowerStage;

// Базовые стадии цветка для Инкубатора 01
const stages = [
    { min: 0, max: 20, name: "Зерно космоса", img: "./img/seed.png" },
    { min: 21, max: 50, name: "Первый росток", img: "./img/sprout.png" },
    { min: 51, max: 100, name: "Энергетическая колба", img: "./img/Incubator.png" }
];

document.addEventListener("DOMContentLoaded", () => {
    
    // Элементы модалки и навигации
    const gardenFab = document.getElementById('garden-fab');
    const gardenModal = document.getElementById('garden-modal');
    const closeGardenBtn = document.getElementById('close-garden');
    const shareBtn = document.getElementById('share-btn');
    
    // Элементы инкубатора
    const flowerImage = document.getElementById('flower-image');
    const flowerStageText = document.getElementById('flower-stage-name'); 
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    // Элементы переключения инкубаторов (Табы)
    const tabCapsule1 = document.getElementById('tab-capsule-1');
    const tabCapsule2 = document.getElementById('tab-capsule-2');
    const capsule1 = document.getElementById('capsule-1');
    const capsule2 = document.getElementById('capsule-2');

    // Элементы боковых датчиков для динамической смены в JS
    const flowerStageNum = document.getElementById('flower-stage'); 
    const envStatus = document.querySelector('.side-panel-right .stat-indicator:nth-child(1) .stat-value');
    const envTemp = document.querySelector('.side-panel-right .stat-indicator:nth-child(2) .stat-value');
    const envHumidity = document.querySelector('.side-panel-right .stat-indicator:nth-child(3) .stat-value');
    const flowerPotential = document.querySelector('.side-panel-left .stat-indicator:nth-child(3) .stat-value');
    
    let generatedRefLink = ""; 
    let globalCurrentScore = 0; // Переменная для хранения текущего баланса
    let activeTab = 1;          // Храним информацию, какой таб сейчас открыт

    // --- ЛОГИКА ОТКРЫТИЯ И ЗАКРЫТИЯ МОДАЛКИ ---
    if (gardenFab && gardenModal) {
        gardenFab.addEventListener('click', () => {
            gardenModal.style.display = 'flex'; 
            initGardenData(); 
        });
    }

    if (closeGardenBtn && gardenModal) {
        closeGardenBtn.addEventListener('click', () => {
            gardenModal.style.display = 'none';
        });
    }

    if (gardenModal) {
        gardenModal.addEventListener('click', (event) => {
            if (event.target === gardenModal) {
                gardenModal.style.display = 'none';
            }
        });
    }

    // --- УПРАВЛЕНИЕ ДАТЧИКАМИ ЧЕРЕЗ JS ПРИ ПЕРЕКЛЮЧЕНИИ ТАБОВ ---
    function renderTabsAndStats() {
        if (activeTab === 1) {
            tabCapsule1.classList.add('active-cyan');
            tabCapsule2.classList.remove('active-purple');
            capsule1.classList.add('active-capsule');
            capsule2.classList.remove('active-capsule');

            if (flowerStageNum) {
                flowerStageNum.innerText = "01";
                flowerStageNum.className = "stat-value highlight-cyan";
            }
            if (flowerPotential) flowerPotential.innerText = "100%";
            if (envStatus) {
                envStatus.innerText = "ОПТИМАЛЬНЕ";
                envStatus.className = "stat-value text-success";
            }
            if (envTemp) envTemp.innerText = "22.5 °C";
            if (envHumidity) envHumidity.innerText = "60%";

            const maxScore = 100;
            let progressPercent = Math.min((globalCurrentScore / maxScore) * 100, 100);
            if (progressText) progressText.innerText = `${globalCurrentScore} / ${maxScore} XP`;
            if (progressFill) progressFill.style.width = `${progressPercent}%`;

            let currentStageIndex = stages.findIndex(stage => globalCurrentScore >= stage.min && globalCurrentScore <= stage.max);
            if (currentStageIndex === -1) currentStageIndex = stages.length - 1;
            if (flowerStageText) flowerStageText.innerText = stages[currentStageIndex].name;

        } else if (activeTab === 2) {
            tabCapsule2.classList.add('active-purple');
            tabCapsule1.classList.remove('active-cyan');
            capsule2.classList.add('active-capsule');
            capsule1.classList.remove('active-capsule');

            if (flowerStageNum) {
                flowerStageNum.innerText = "02";
                flowerStageNum.className = "stat-value highlight-purple"; 
            }

            if (globalCurrentScore < 100) {
                if (flowerStageText) flowerStageText.innerText = "ЗАБЛОКОВАНО";
                if (flowerPotential) flowerPotential.innerText = "??%";
                if (envStatus) {
                    envStatus.innerText = "НЕВИЗНАЧЕНО";
                    envStatus.className = "stat-value text-muted";
                }
                if (envTemp) envTemp.innerText = "--.- °C";
                if (envHumidity) envHumidity.innerText = "--%";
                if (progressText) progressText.innerText = "0 / ??? XP";
                if (progressFill) progressFill.style.width = "0%";
            } else {
                if (flowerStageText) flowerStageText.innerText = "ПЕРШИЙ РОСТОК";
                if (flowerPotential) flowerPotential.innerText = "23%";
                if (envStatus) {
                    envStatus.innerText = "ОПТИМАЛЬНА";
                    envStatus.className = "stat-value text-success";
                }
                if (envTemp) envTemp.innerText = "23.1 °C";
                if (envHumidity) envHumidity.innerText = "68%";
                if (progressText) progressText.innerText = "0 / 100 XP"; 
                if (progressFill) progressFill.style.width = "0%";
            }
        }
    }

    if (tabCapsule1 && tabCapsule2 && capsule1 && capsule2) {
        tabCapsule1.addEventListener('click', () => {
            activeTab = 1;
            renderTabsAndStats();
        });

        tabCapsule2.addEventListener('click', () => {
            activeTab = 2;
            renderTabsAndStats();
        });
    }

    // --- ИНИЦИАЛИЗАЦИЯ ДАННЫХ САДА ---
    initGardenData = function() {
        const tg = window.Telegram?.WebApp;
        const userId = tg?.initDataUnsafe?.user?.id || "123456789"; 
        const botUsername = "AlexaFleurBot"; 
        
        generatedRefLink = `https://t.me/${botUsername}?start=ref_${userId}`;
        loadUserBalance();
    };

    // --- ЛОГИКА РОСТА ЗЕРНА И БЛОКИРОВКИ КАПСУЛЫ ---
    updateFlowerStage = function(score) {
        let currentScore = parseInt(score);
        if (isNaN(currentScore) || currentScore < 0) {
            currentScore = 0;
        }
        
        globalCurrentScore = currentScore; 
        
        let currentStageIndex = stages.findIndex(stage => currentScore >= stage.min && currentScore <= stage.max);
        if (currentStageIndex === -1) currentStageIndex = stages.length - 1;
        
        const activeStage = stages[currentStageIndex];
        if (flowerImage && flowerImage.tagName === "IMG") { 
            flowerImage.src = activeStage.img; 
        }

        const lockedIcon = document.getElementById('capsule-locked-icon');
        const purpleFlowerImg = document.getElementById('flower-image-purple');

        if (lockedIcon && purpleFlowerImg) {
            if (currentScore >= 100) {
                lockedIcon.style.display = 'none';        
                purpleFlowerImg.style.display = 'block';  
            } else {
                lockedIcon.style.display = 'block';       
                purpleFlowerImg.style.display = 'none';   
            }
        }

        renderTabsAndStats();
    };

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const tg = window.Telegram?.WebApp;
            const userId = tg?.initDataUnsafe?.user?.id || "123456789";
            
            generatedRefLink = `https://t.me/AlexaFleurBot?start=ref_${userId}`;
            
            const text = encodeURIComponent("Привіт! Заходь у квіткову вітрину AlexaFleur 🌱 Допоможи мені виростити віртуальный сад!");
            const shareUrl = `https://t.me/share/url?url=${generatedRefLink}&text=${text}`;
            
            if (tg) {
                tg.openTelegramLink(shareUrl);
            } else {
                window.open(shareUrl, '_blank');
            }
        });
    }
    
    const tg = window.Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id || "123456789";
    generatedRefLink = `https://t.me/AlexaFleurBot?start=ref_${userId}`;
});

// --- ПОЛУЧЕНИЕ РЕАЛЬНОГО БАЛАНСА ИЗ N8N ---

async function loadUserBalance() {
    const webapp = window.Telegram?.WebApp;
    if (!webapp) return;

    const user = webapp.initDataUnsafe?.user;
    if (!user) return;

    const startParam = webapp.initDataUnsafe?.start_param; 
    const webhookUrl = 'https://tiktiok.xyz/webhook/getusersbalanse'; 
    
    let finalUrl = `${webhookUrl}?telegram_id=${user.id}`;
    if (startParam) {
        finalUrl += `&inviter_id=${startParam}`;
    }

    try {
        const response = await fetch(finalUrl);
        if (response.ok) {
            let data = await response.json();
            
            // Логируем чистый ответ, чтобы видеть, какие ключи приходят из Таблицы
            console.log("Ответ от n8n:", JSON.stringify(data));

            if (Array.isArray(data)) data = data[0];
            
            if (data) {
                // Умный поиск баланса: проверяем поочередно xp, XP, balance или Монеты
                const rawBalance = data.xp !== undefined ? data.xp : 
                                   data.XP !== undefined ? data.XP : 
                                   data.balance !== undefined ? data.balance : 
                                   data.coins !== undefined ? data.coins : null;

                if (rawBalance !== null) {
                    const realBalance = parseInt(rawBalance, 10);
                    
                    // Обновляем цифру на экране игры
                    const balanceElement = document.getElementById('user-balance'); 
                    if (balanceElement) {
                        balanceElement.textContent = realBalance;
                    }
                    
                    // Передаем баланс в логику отрисовки цветка
                    if (typeof updateFlowerStage === 'function') {
                        updateFlowerStage(realBalance);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Ошибка работы вебхука баланса:', error);
    }
}

// Инициализация Телеграма с микро-задержкой для стабильности функций
if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    
    // Даем DOMContentLoaded 150мс, чтобы гарантированно объявить функции
    setTimeout(() => {
        loadUserBalance();
    }, 150);
    
    setInterval(() => {
        loadUserBalance();
    }, 6000);
}

// 9. АНИМАЦИЯ ПОЯВЛЕНИЯ И УДАЛЕНИЯ ПУЛЬСИРОВАННОЙ КНОПКИ (ЧАТ)
function startChatPulse() {
    const fab = document.querySelector('.floric-fab');
    const menu = document.querySelector('.contact-menu');
    if (!fab) return;

    function toggleFab() {
        // 1. Показываем кнопку
        fab.classList.add('visible');

        // 2. Через 20 секунд прячем обратно
        setTimeout(() => {
            fab.classList.remove('visible');
            // Если меню было открыто — закрываем его при исчезновении кнопки
            if (menu) menu.style.display = 'none'; 
        }, 20000); // 20 сек (можешь поставить 30000 для 30 сек)
    }

    // Запускаем первый раз сразу
    toggleFab();

    // Ставим интервал на 1 минуту (60000 мс)
    setInterval(toggleFab, 60000);
}

// Запускаем функцию
document.addEventListener('DOMContentLoaded', startChatPulse);

// 10. ВСПОМОГАТЕЛЬНОЕ
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

function openAIChat() {
    document.getElementById('contact-menu').style.display = 'none';
    document.getElementById('ai-chat-window').style.display = 'flex';
    
    const msgContainer = document.getElementById('ai-messages');
    if (msgContainer.innerHTML.trim() === "") {
        addMessage("Здраствуйте! Вас приветствует AlexaFleur! Что подберем вам сегодня ?", 'ai');
    }
}

function closeAIChat() {
    document.getElementById('ai-chat-window').style.display = 'none';
}

function addMessage(text, side) {
    const container = document.getElementById('ai-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg-${side}`;

    let formattedText = text;

    // Регулярка ловит любую голенькую ссылку (начиная с http/https)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = formattedText.match(urlRegex);

    if (urls && side === 'ai') {
        const imageUrl = urls[0]; // Берем ссылку на картинку
        
        // Полностью удаляем саму текстовую ссылку из сообщения
        formattedText = formattedText.replace(imageUrl, '').trim();
        
        // Очищаем от возможных скобок, если бот их случайно оставит
        formattedText = formattedText.replace(/\[\s*\]/g, '').replace(/\(\s*\)/g, '');

        // Выводим чистый текст, а прямо под ним — сочную картинку
        msgDiv.innerHTML = `${formattedText}<br><img src="${imageUrl}" style="width:100%; border-radius:10px; margin-top:10px; display:block;">`;
    } else {
        // Если ссылок нет (обычный диалог) — выводим как есть
        msgDiv.innerHTML = formattedText; 
    }
    
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// ФУНКЦИЯ ДЛЯ ПАУЗЫ (чтобы сообщения шли по очереди)
const delay = ms => new Promise(res => setTimeout(res, ms));

async function sendToAI() {
    const input = document.getElementById('ai-user-input');
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';

    try {
        const response = await fetch('https://tiktiok.xyz/webhook/site-chat-fleur', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                message: text,
                sessionId: tg?.initDataUnsafe?.user?.id || "dev_user" 
            })
        });
        
        const data = await response.json();
        const fullOutput = data.output || "";

        if (!fullOutput) {
            addMessage("Зачекайте хвилину, я особисто перевіряю якість сьогоднішньої поставки для Вас...", 'ai');
            return;
        }

        // РАЗРЕЗАЕМ ОТВЕТ ПО МАРКЕРУ
        const messages = fullOutput.split('---SPLIT---');

        // ВЫВОДИМ КАЖДОЕ СООБЩЕНИЕ С ПАУЗОЙ
        for (const msg of messages) {
            const cleanMsg = msg.trim();
            if (cleanMsg) {
                await delay(600); // Задержка 0.6 сек для солидности
                addMessage(cleanMsg, 'ai');
            }
        }

    } catch (e) {
        addMessage("Перепрошую, виникла невелика технічна заминка. Спробуйте, будь ласка, ще раз через мить.", 'ai');
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter') sendToAI();
}