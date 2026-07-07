document.addEventListener('DOMContentLoaded', () => {
    // Nav Navigation Core Nodes
    const brandLogo = document.getElementById('brandLogo');
    const backToCatalog = document.getElementById('backToCatalog');
    const navControls = document.getElementById('navControls');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productItems = document.querySelectorAll('.product-item');
    
    // Page Core Trackers
    const catalogPage = document.getElementById('catalogPage');
    const detailPage = document.getElementById('detailPage');

    // Dynamic Product Visual Reflector Nodes
    const detailProductImg = document.getElementById('detailProductImg');
    const detailProductCategory = document.getElementById('detailProductCategory');
    const detailProductTitle = document.getElementById('detailProductTitle');
    const detailProductPrice = document.getElementById('detailProductPrice');
    const detailProductDescription = document.getElementById('detailProductDescription');
    const detailStockChart = document.getElementById('detailStockChart');
    const stockBars = document.getElementById('stockBars');
    
    // Config Input Controls
    const sizeButtons = document.querySelectorAll('#detailSizeSelector .size-btn');
    const decreaseQty = document.getElementById('detailDecreaseQty');
    const increaseQty = document.getElementById('detailIncreaseQty');
    const qtyValue = document.getElementById('detailQtyValue');
    const detailAddToCart = document.getElementById('detailAddToCart');

    // Shopping Cart Drawer Node Controllers
    const cartTrigger = document.getElementById('cartTrigger');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartCount = document.getElementById('cartCount');
    const cartDrawerCount = document.getElementById('cartDrawerCount');
    const cartItemsList = document.getElementById('cartItemsList');
    const emptyCartText = document.getElementById('emptyCartText');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const checkoutCartWa = document.getElementById('checkoutCartWa');

    // System Application State Variables
    let currentCategory = 'all';
    let selectedSize = 'M';
    let currentQty = 1;
    let activeProduct = {};
    let globalCart = JSON.parse(localStorage.getItem('archive_cart')) || [];

    // DATA SPONSOR UTAMA - NOMOR WA CHECKOUT TUJUAN
    const whatsappNumber = "6281217538688";

    // Initialize System UI States
    updateCartUI();

    // --- SYSTEMS ROUTER NAV MANAGER ---
    function navigateToPage(pageId) {
        catalogPage.classList.remove('active-view', 'hidden-view');
        detailPage.classList.remove('active-view', 'hidden-view');
        
        if (pageId === 'catalog') {
            detailPage.classList.add('hidden-view');
            catalogPage.classList.add('active-view');
            navControls.style.opacity = '1';
            navControls.style.pointerEvents = 'auto';
            setTimeout(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, 150);
        } else if (pageId === 'detail') {
            catalogPage.classList.add('hidden-view');
            detailPage.classList.add('active-view');
            navControls.style.opacity = '0';
            navControls.style.pointerEvents = 'none';
            setTimeout(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, 150);
        }
    }

    // --- COMPREHENSIVE FILTER SYSTEM ---
    searchInput.addEventListener('input', filterProducts);
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            currentCategory = e.currentTarget.getAttribute('data-target');
            filterButtons.forEach(btn => {
                btn.classList.remove('active-btn');
                btn.classList.add('inactive-btn');
            });
            e.currentTarget.classList.remove('inactive-btn');
            e.currentTarget.classList.add('active-btn');
            filterProducts();
        });
    });

    function filterProducts() {
        const query = searchInput.value.toLowerCase().trim();
        productItems.forEach(item => {
            const name = item.getAttribute('data-name').toLowerCase();
            const category = item.getAttribute('data-category').toLowerCase();
            const matchesSearch = name.includes(query);
            const matchesCategory = currentCategory === 'all' || category === currentCategory;
            item.style.display = (matchesSearch && matchesCategory) ? 'flex' : 'none';
        });
    }

    // --- DETAILS PAGE INTERACTION INTERFACE ---
    productItems.forEach(item => {
        item.addEventListener('click', () => {
            const sizesRaw = item.getAttribute('data-sizes');
            activeProduct = {
                id: item.getAttribute('data-id'),
                name: item.getAttribute('data-name'),
                category: item.getAttribute('data-category'),
                price: item.getAttribute('data-price'),
                numericPrice: parseInt(item.getAttribute('data-numeric-price')),
                img: item.getAttribute('data-img'),
                description: item.getAttribute('data-description') || '',
                sizes: sizesRaw ? JSON.parse(sizesRaw) : null
            };

            detailProductImg.src = activeProduct.img;
            detailProductCategory.textContent = activeProduct.category;
            detailProductTitle.textContent = activeProduct.name;
            detailProductPrice.textContent = activeProduct.price;
            detailProductDescription.textContent = activeProduct.description;

            // Render size guide if data exists
            if (activeProduct.sizes) {
                const entries = Object.entries(activeProduct.sizes);
                const measurements = Object.keys(entries[0][1]); // e.g. ['chest','length'] or ['wrist']

                // Header row
                const headerCols = ['SIZE', ...measurements.map(m => m.toUpperCase())].map(h =>
                    `<th class="text-[9px] font-bold tracking-widest text-zinc-400 text-left pb-2 pr-6">${h}</th>`
                ).join('');

                // Data rows
                const dataRows = entries.map(([size, vals]) => {
                    const cells = [
                        `<td class="text-[10px] font-bold tracking-widest uppercase text-zinc-900 py-2 pr-6">${size}</td>`,
                        ...measurements.map(m =>
                            `<td class="text-xs text-zinc-500 py-2 pr-6">${vals[m]} cm</td>`
                        )
                    ].join('');
                    return `<tr class="border-t border-zinc-100">${cells}</tr>`;
                }).join('');

                stockBars.innerHTML = `
                    <table class="w-full border-collapse">
                        <thead><tr>${headerCols}</tr></thead>
                        <tbody>${dataRows}</tbody>
                    </table>`;
                detailStockChart.classList.remove('hidden');
            } else {
                detailStockChart.classList.add('hidden');
            }

            currentQty = 1;
            qtyValue.textContent = currentQty;
            selectedSize = 'M';
            sizeButtons.forEach(b => b.classList.remove('selected'));
            document.querySelector('#detailSizeSelector [data-size="M"]').classList.add('selected');

            navigateToPage('detail');
        });
    });

    backToCatalog.addEventListener('click', () => navigateToPage('catalog'));
    brandLogo.addEventListener('click', (e) => { e.preventDefault(); navigateToPage('catalog'); });

    // Size Controls Configuration
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            sizeButtons.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedSize = e.target.getAttribute('data-size');
        });
    });

    increaseQty.addEventListener('click', () => { currentQty++; qtyValue.textContent = currentQty; });
    decreaseQty.addEventListener('click', () => { if (currentQty > 1) { currentQty--; qtyValue.textContent = currentQty; } });

    // --- COMMERCE SHOPPING CART UTILITY CONFIG ---
    cartTrigger.addEventListener('click', () => document.body.classList.add('cart-open'));
    closeCart.addEventListener('click', () => document.body.classList.remove('cart-open'));
    cartOverlay.addEventListener('click', () => document.body.classList.remove('cart-open'));

    detailAddToCart.addEventListener('click', () => {
        const itemKey = `${activeProduct.id}-${selectedSize}`;
        const existingItemIndex = globalCart.findIndex(item => item.cartId === itemKey);

        if (existingItemIndex > -1) {
            globalCart[existingItemIndex].qty += currentQty;
        } else {
            globalCart.push({
                cartId: itemKey,
                id: activeProduct.id,
                name: activeProduct.name,
                price: activeProduct.price,
                numericPrice: activeProduct.numericPrice,
                img: activeProduct.img,
                size: selectedSize,
                qty: currentQty
            });
        }

        localStorage.setItem('archive_cart', JSON.stringify(globalCart));
        updateCartUI();
        document.body.classList.add('cart-open'); // Otomatis buka keranjang biar keliatan feedback-nya
    });

    function updateCartUI() {
        const totalItems = globalCart.reduce((acc, current) => acc + current.qty, 0);
        
        // Atur status indikator badge angka navbar
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.classList.remove('scale-0');
            cartCount.classList.add('scale-100');
            emptyCartText.style.display = 'none';
            checkoutCartWa.disabled = false;
        } else {
            cartCount.classList.remove('scale-100');
            cartCount.classList.add('scale-0');
            emptyCartText.style.display = 'block';
            checkoutCartWa.disabled = true;
        }

        cartDrawerCount.textContent = totalItems;

        // Render elemen list item belanjaan
        const itemsListMarkup = globalCart.map((item, index) => `
            <div class="flex gap-4 items-center border-b border-zinc-100 pb-4">
                <img src="${item.img}" alt="${item.name}" class="w-16 h-20 object-cover bg-zinc-50">
                <div class="flex-grow">
                    <h4 class="text-xs font-bold uppercase tracking-wide text-zinc-900">${item.name}</h4>
                    <p class="text-[10px] text-zinc-400 uppercase mt-0.5">Size: ${item.size} | Qty: ${item.qty}</p>
                    <p class="text-xs text-zinc-600 mt-1 font-medium">${item.price}</p>
                </div>
                <button onclick="window.removeCartItemNode(${index})" class="text-zinc-300 hover:text-red-600 transition-colors p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>
        `).join('');

        // Masukin markup list produk baru atau kosongkan jika gada item
        const defaultPlaceholder = `<p id="emptyCartText" class="text-zinc-400 text-xs uppercase tracking-wider text-center py-12">Your cart is empty.</p>`;
        cartItemsList.innerHTML = totalItems > 0 ? itemsListMarkup : defaultPlaceholder;

        // Hitung akumulasi total biaya belanjaan
        const totalCost = globalCart.reduce((acc, current) => acc + (current.numericPrice * current.qty), 0);
        cartTotalPrice.textContent = `Rp ${totalCost.toLocaleString('id-ID')}`;
    }

    // Expose fungsi ke window context agar inline onclick di markup list bekerja
    window.removeCartItemNode = function(index) {
        globalCart.splice(index, 1);
        localStorage.setItem('archive_cart', JSON.stringify(globalCart));
        updateCartUI();
    };

    // --- COMMERCIAL BULK ORDER SYSTEM TO WHATSAPP ---
    checkoutCartWa.addEventListener('click', () => {
        if (globalCart.length === 0) return;

        let message = `Halo Admin, saya ingin memesan daftar belanjaan berikut:\n\n`;
        
        globalCart.forEach((item, index) => {
            const subtotal = item.numericPrice * item.qty;
            message += `${index + 1}. ${item.name.toUpperCase()}\n` +
                       `   • Size : ${item.size}\n` +
                       `   • Qty  : ${item.qty} pcs\n` +
                       `   • Sub  : Rp ${subtotal.toLocaleString('id-ID')}\n\n`;
        });

        const totalCost = globalCart.reduce((acc, current) => acc + (current.numericPrice * current.qty), 0);
        message += `-----------------------------------\n` +
                   `• TOTAL ESTIMASI: Rp ${totalCost.toLocaleString('id-ID')}\n\n` +
                   `Mohon konfirmasi ketersediaan stok size masing-masing produk dan total ongkirnya. Terima kasih!`;

        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        const opened = window.open(waUrl, '_blank');

        // Kosongkan keranjang hanya jika WhatsApp berhasil dibuka
        if (opened) {
            globalCart = [];
            localStorage.removeItem('archive_cart');
            updateCartUI();
            document.body.classList.remove('cart-open');
        }
    });
});