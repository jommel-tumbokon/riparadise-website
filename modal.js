/* ==========================================================
   1. STATE & INITIALIZATION
   ========================================================== */
   let isModalOpen = false;

   /* ==========================================================
      2. MODAL CORE FUNCTIONS (Open / Close)
      ========================================================== */
   function openProductModal(title, price, imgSrc, showSizeChart = true) {
       const modal = document.getElementById('productQuickViewModal');
       if (!modal) return;
   
       // A. Update Basic Product Info
       // A. Update Basic Product Info
if (title) document.getElementById('modalProductTitle').innerText = title;
if (price) document.getElementById('modalProductPrice').innerText = price;
if (imgSrc) document.getElementById('modalProductImg').src = imgSrc;
if (title) document.getElementById('modalProductImg').alt = title;
   
              // B. Handle Size Chart Visibility & Rendering
              toggleSizeChartVisibility(showSizeChart);
       
              if (showSizeChart) {
                  renderSizeChart();
                  renderSizeOptions();
              }
   
       // C. Load Config Text to Modal Elements
       updateModalTextFromConfig();
   
       // D. Reset Quantity Input
       const qtyInput = document.getElementById('modalQtyInput');
       if (qtyInput) qtyInput.value = 1;
   
       // E. Open Modal & Lock Background Scroll
       modal.classList.add('is-active');
       document.body.style.overflow = 'hidden';
       isModalOpen = true;
       document.addEventListener('keydown', handleEscKey);
   }
   
   function closeProductModal() {
       const modal = document.getElementById('productQuickViewModal');
       if (!modal) return;
   
       modal.classList.remove('is-active');
       document.body.style.overflow = ''; // Restore scrolling
       isModalOpen = false;
       document.removeEventListener('keydown', handleEscKey);
   }
   
   
   /* ==========================================================
   3. HELPER FUNCTIONS (Rendering & UI Updates)
   ========================================================== */

/* Update Modal Text from CONFIG */
function updateModalTextFromConfig() {

  const cfg = CONFIG.productModal;

  // Helper function para sa lahat ng text elements
  const setText = (id, value) => {

      const el = document.getElementById(id);

      if (!el) return;

      el.textContent = value ?? "";

  };

  // Product Info
  setText("modal-stock-status", cfg.stockStatus);
  setText("modal-size-chart-title", cfg.sizeChartTitle);
  setText("modal-add-to-cart-button", cfg.addToCartButton);
  setText("modal-size-label", cfg.sizeLabel);

  // Size Chart Headers
  setText("size-chart-size-header", cfg.sizeChartHeaders.size);
  setText("size-chart-chest-header", cfg.sizeChartHeaders.chest);
  setText("size-chart-length-header", cfg.sizeChartHeaders.length);

}


/* Render Size Chart Rows */
function renderSizeChart() {
    const sizeChartBody = document.getElementById("modal-size-chart-body");
    if (!sizeChartBody || !CONFIG.productModal.sizeChartRows) return;

    sizeChartBody.innerHTML = CONFIG.productModal.sizeChartRows
        .map(row => `
            <tr>
                <td><strong>${row.size}</strong></td>
                <td>${row.chest}</td>
                <td>${row.length}</td>
            </tr>
        `)
        .join("");
}

/* Render Size Options (S, M, L, XL) dynamically from CONFIG */
function renderSizeOptions() {
    const container = document.getElementById("modal-size-options-grid");
    if (!container || !CONFIG.productModal.sizeChartRows) return;

    // Linisin muna ang lalagyan bago maglagay ng bago
    container.innerHTML = "";

    // I-loop ang sizes mula sa CONFIG
    CONFIG.productModal.sizeChartRows.forEach((row, index) => {
        const isChecked = index === 0 ? "checked" : ""; // Ang unang size (S) ang default na check
        
        const labelHTML = `
            <label class="p-size-box">
                <input type="radio" name="product-size" value="${row.size}" ${isChecked}>
                <span>${row.size}</span>
            </label>
        `;
        
        container.innerHTML += labelHTML;
    });
}


/* Show / Hide Size Chart */
function toggleSizeChartVisibility(show) {

  const displayStyle = show ? "" : "none";

  const elements = [

      document.getElementById("modalSizeChartSection"),
      document.querySelector(".p-size-header-row"),
      document.querySelector(".p-size-options-grid")

  ];

  elements.forEach(el => {

      if (el) {

          el.style.display = displayStyle;

      }

  });

}
   
   
   /* ==========================================================
      4. CART & QUANTITY ACTIONS (Business Logic)
      ========================================================== */
   function adjustModalQty(change) {
       const qtyInput = document.getElementById('modalQtyInput');
       if (!qtyInput) return;
       
       let currentQty = parseInt(qtyInput.value) || 1;
       // Math.max ensures na hindi bababa sa 1 ang quantity
       qtyInput.value = Math.max(1, currentQty + change);
   }
   
   function triggerAddToCart() {
       const sizeInput = document.querySelector('input[name="product-size"]:checked');
       const selectedSize = sizeInput ? sizeInput.value : 'S'; // Fallback to 'S' if none selected
       
       const qtyEl = document.getElementById('modalQtyInput');
       const itemQuantity = qtyEl ? (parseInt(qtyEl.value) || 1) : 1;
   
       const productTitle = document.getElementById('modalProductTitle').innerText;
       const productPrice = document.getElementById('modalProductPrice').innerText;
       const productImg = document.getElementById('modalProductImg').src;
   
       const cartItem = { 
           title: productTitle, 
           price: productPrice, 
           size: selectedSize, 
           quantity: itemQuantity, 
           image: productImg 
       };
   
       // Check kung nasa cart na ang item (same title + same size)
       const existingItemIndex = riparadiseCart.findIndex(
           item => item.title === cartItem.title && item.size === cartItem.size
       );
   
       if (existingItemIndex > -1) {
           riparadiseCart[existingItemIndex].quantity += itemQuantity;
       } else {
           riparadiseCart.push(cartItem);
       }
   
       // Save to LocalStorage
       localStorage.setItem('rip_cart', JSON.stringify(riparadiseCart));
   
       // Update UI (with safety checks kung naka-load na ang functions from other files)
       if (typeof updateCartBadgeUI === 'function') updateCartBadgeUI();
       if (typeof showRiparadiseToast === 'function') {
           showRiparadiseToast(`${productTitle} (${selectedSize}) x${itemQuantity}`);
       }
   
       closeProductModal();
   }
   
   
  /* ==========================================================
   5. EVENT LISTENERS & UTILITIES
   ========================================================== */

// A. NEW: Attach Event Listeners to Modal Buttons (Replacing inline onclick)
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Modal Close Button (X)
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }

    // 2. Quantity Minus Button
    const qtyMinusBtn = document.getElementById('modal-qty-minus');
    if (qtyMinusBtn) {
        qtyMinusBtn.addEventListener('click', () => adjustModalQty(-1));
    }

    // 3. Quantity Plus Button
    const qtyPlusBtn = document.getElementById('modal-qty-plus');
    if (qtyPlusBtn) {
        qtyPlusBtn.addEventListener('click', () => adjustModalQty(1));
    }

    // 4. Add to Cart Button
    const addToCartBtn = document.getElementById('modal-add-to-cart-button');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', triggerAddToCart);
    }
});

// B. EXISTING: Close modal on ESC key
function handleEscKey(event) {
    if (event.key === 'Escape' && isModalOpen) {
        closeProductModal();
    }
}

// C. EXISTING: Close modal when clicking the backdrop (outside the modal content)
document.addEventListener('click', (event) => {
    const modal = document.getElementById('productQuickViewModal');
    if (event.target === modal) {
        closeProductModal();
    }
});

// D. EXISTING: Scroll to size chart utility
function scrollToSizeChart() {
    const targetSection = document.getElementById('modalSizeChartSection');
    const detailsPanel = document.getElementById('modalDetailsContainer');
    
    if (targetSection && detailsPanel) {
        detailsPanel.scrollTo({ 
            top: targetSection.offsetTop - 20, 
            behavior: 'smooth' 
        });
    }
}