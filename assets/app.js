const INSTAGRAM_PROFILE = "https://www.instagram.com/drago__n1__/";

const INSTAGRAM_DM_WEB =
  "https://www.instagram.com/direct/t/17845443282150287/";

function openInstagramDM() {
  const appUrl = "instagram://direct/t/17845443282150287/";
  const webUrl = INSTAGRAM_DM_WEB;

  // Try opening the Instagram app
  window.location.href = appUrl;

  // Fallback to Instagram Web if the app doesn't open
  setTimeout(() => {
    window.location.href = webUrl;
  }, 1200);
}
let PRODUCTS = [];
// Format Egyptian pound prices consistently across the site.
function money(value) {
  return `${Number(value).toLocaleString("en-EG")} EGP`;
}

// Read the cart safely from localStorage.
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

// Save the cart and refresh every cart-related UI element.
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  refreshCartUI();
}

// Return the total number of pieces currently selected.
function cartCount() {
  return getCart().reduce((total, item) => total + item.qty, 0);
}

// Update the small cart badge in every page header.
function updateCartCount() {
  const count = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = count;
    element.classList.toggle("hidden", count === 0);
  });
}

// Add one unit of a product to the cart.
function addToCart(id) {
  const product = PRODUCTS.find((item) => item.id === id);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }

  saveCart(cart);
  showToast(`${product.name} added to cart`);
}

// Set an exact quantity for one product.
function setQty(id, quantity) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === id);
  const nextQuantity = Math.max(0, Number(quantity));

  // A plus button on a product with quantity 0 should create the cart line.
  if (!item) {
    if (nextQuantity > 0) cart.push({ id, qty: nextQuantity });
    saveCart(cart);
    return;
  }

  item.qty = nextQuantity;
  saveCart(cart.filter((entry) => entry.qty > 0));
}

// Remove a product completely from the cart.
function removeItem(id) {
  saveCart(getCart().filter((item) => item.id !== id));
}

// Calculate the current cart subtotal from the product catalog.
function cartTotal() {
  return getCart().reduce((total, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.id);
    return total + (product ? product.price * item.qty : 0);
  }, 0);
}

// Return the quantity of a specific product in the cart.
function getQty(id) {
  return getCart().find((item) => item.id === id)?.qty || 0;
}

// Render the cart drawer contents.
function renderCart() {
  const container = document.querySelector("[data-cart-items]");
  if (!container) return;

  const cart = getCart();

  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Choose a timepiece and build your selection.</p>
        <a href="products.html" class="cart-empty-link">Explore collection</a>
      </div>`;
  } else {
    container.innerHTML = cart.map((item) => {
      const product = PRODUCTS.find((entry) => entry.id === item.id);
      if (!product) return "";

      return `
        <article class="cart-item">
          <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
          <div class="cart-item-info">
            <div class="cart-item-category">${product.category}</div>
            <h3>${product.name}</h3>
            <p>${money(product.price)}</p>
            <div class="quantity" aria-label="Quantity for ${product.name}">
              <button type="button" aria-label="Decrease ${product.name}" onclick="setQty('${product.id}', ${item.qty - 1})">−</button>
              <span>${item.qty}</span>
              <button type="button" aria-label="Increase ${product.name}" onclick="setQty('${product.id}', ${item.qty + 1})">+</button>
            </div>
          </div>
          <button class="remove-item" type="button" aria-label="Remove ${product.name}" onclick="removeItem('${product.id}')">Remove</button>
        </article>`;
    }).join("");
  }

  document.querySelectorAll("[data-cart-total]").forEach((element) => {
    element.textContent = money(cartTotal());
  });
}

// Refresh the cart drawer, badge, product quantities and checkout button state.
function refreshCartUI() {
  renderCart();
  updateCartCount();
  renderProductQuantities();
  updateCheckoutButton();
}

// Disable checkout when the cart is empty and keep the CTA visually honest.
function updateCheckoutButton() {
  const button = document.querySelector("[data-checkout-link]");
  if (!button) return;

  const hasItems = getCart().length > 0;
  button.classList.toggle("is-disabled", !hasItems);
  button.setAttribute("aria-disabled", String(!hasItems));
  button.href = hasItems ? "checkout.html" : "products.html";
}

// Open the cart drawer and lock page scrolling.
function openCart() {
  document.querySelector("[data-cart]")?.classList.add("open");
  document.querySelector("[data-cart-overlay]")?.classList.add("open");
  document.body.classList.add("cart-is-open");
}

// Close the cart drawer and restore page scrolling.
function closeCart() {
  document.querySelector("[data-cart]")?.classList.remove("open");
  document.querySelector("[data-cart-overlay]")?.classList.remove("open");
  document.body.classList.remove("cart-is-open");
}

// Show a small non-blocking status message.
function showToast(message) {
  const toast = document.querySelector("[data-toast]");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__dragonToast);
  window.__dragonToast = setTimeout(() => toast.classList.remove("show"), 2600);
}

// Keep product-card quantity controls synchronized with localStorage.
function renderProductQuantities() {
  document.querySelectorAll("[data-product-id]").forEach((card) => {
    const id = card.dataset.productId;
    const quantity = getQty(id);
    const number = card.querySelector(".quantity span");
    const minus = card.querySelector(".quantity button:first-child");
    const plus = card.querySelector(".quantity button:last-child");

    if (number) number.textContent = quantity;
    if (minus) minus.onclick = () => setQty(id, quantity - 1);
    if (plus) plus.onclick = () => setQty(id, quantity + 1);
  });
}

// Build one clean product card without excessive visual effects.
function productCard(product) {
  const quantity = getQty(product.id);

  return `
    <article class="product-card reveal" data-product-id="${product.id}">
      <a href="products.html#${product.id}" class="product-media">
        <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
        <span class="product-badge">${product.badge}</span>
      </a>
      <div class="product-info">
        <div class="product-topline">
          <div>
            <div class="product-category">${product.category}</div>
            <h3>${product.name}</h3>
          </div>
          <div class="quantity" aria-label="Quantity for ${product.name}">
            <button type="button" aria-label="Decrease ${product.name}" onclick="setQty('${product.id}', ${quantity - 1})">−</button>
            <span>${quantity}</span>
            <button type="button" aria-label="Increase ${product.name}" onclick="setQty('${product.id}', ${quantity + 1})">+</button>
          </div>
        </div>
        <p class="product-description">${product.description}</p>
        <div class="product-bottomline">
          <div>
            <strong>${money(product.price)}</strong>
            <span>${money(product.oldPrice)}</span>
          </div>
          <button class="add-to-cart" type="button" onclick="addToCart('${product.id}')">Add to cart</button>
        </div>
      </div>
    </article>`;
}

// Load the JSON catalog and then initialize UI that depends on product data.
async function loadProducts() {
  try {
    const response = await fetch("assets/products.json", { cache: "no-store" });
    PRODUCTS = await response.json();

    renderCart();
    updateCartCount();
    updateCheckoutButton();

    const featured = document.querySelector("[data-featured]");
    if (featured) {
      featured.innerHTML = PRODUCTS.slice(0, 3).map(productCard).join("");
    }

    if (document.querySelector("[data-products-grid]")) {
      renderProductsGrid();
    }

    document.querySelectorAll("[data-product-select]").forEach((select) => {
      select.innerHTML = `<option value="">Select a piece</option>${PRODUCTS.map((product) => `<option value="${product.id}">${product.name} — ${money(product.price)}</option>`).join("")}`;
    });

    setupCheckout();
    observeReveals();
  } catch (error) {
    console.error("Dragon catalog failed to load:", error);
  }
}

// Render the collection page using the selected category.
function renderProductsGrid() {
  const grid = document.querySelector("[data-products-grid]");
  if (!grid) return;

  const category = document.querySelector("[data-filter]")?.value || "All";
  const products = category === "All" ? PRODUCTS : PRODUCTS.filter((product) => product.category === category);

  grid.innerHTML = products.map(productCard).join("");

  const resultCount = document.querySelector("[data-result-count]");
  if (resultCount) resultCount.textContent = `${products.length} pieces`;

  observeReveals();
}

// Highlight the current desktop navigation item.
function setupNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === page);
  });
}

// Add reveal-on-scroll only where it helps hierarchy and never blocks content.
function observeReveals() {
  const elements = document.querySelectorAll(".reveal:not(.in)");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("in"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  elements.forEach((element) => observer.observe(element));
}

// Wire the cart drawer controls and keyboard behavior.
function setupCart() {
  document.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", openCart));
  document.querySelectorAll("[data-close-cart]").forEach((button) => button.addEventListener("click", closeCart));
  document.querySelector("[data-cart-overlay]")?.addEventListener("click", closeCart);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
      closeMobileMenu();
    }
  });
}

// Toggle the mobile navigation drawer.
function toggleMobileMenu() {
  const menu = document.querySelector("[data-mobile-menu]");
  const button = document.querySelector("[data-mobile-menu-button]");
  if (!menu || !button) return;

  const isOpen = menu.classList.toggle("open");
  button.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-is-open", isOpen);
}

// Close the mobile navigation drawer.
function closeMobileMenu() {
  const menu = document.querySelector("[data-mobile-menu]");
  const button = document.querySelector("[data-mobile-menu-button]");
  if (!menu || !button) return;

  menu.classList.remove("open");
  button.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-is-open");
}

// Initialize mobile navigation on pages that contain it.
function setupMobileMenu() {
  document.querySelector("[data-mobile-menu-button]")?.addEventListener("click", toggleMobileMenu);
  document.querySelectorAll("[data-mobile-link]").forEach((link) => link.addEventListener("click", closeMobileMenu));
}

// Render the checkout summary and send the order to the Instagram conversation flow.
function setupCheckout() {
  const form = document.querySelector("[data-order-form]");
  if (!form || form.dataset.ready === "true") return;

  const cart = getCart();
  const emptyState = document.querySelector("[data-checkout-empty]");

  if (!cart.length) {
    emptyState?.classList.remove("hidden");
    form.classList.add("hidden");
    return;
  }

  const summary = document.querySelector("[data-order-summary]");
  if (!summary) return;

  summary.innerHTML = cart.map((item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.id);
    if (!product) return "";

    return `
      <div class="order-line">
        <div>
          <strong>${product.name}</strong>
          <span>Qty ${item.qty}</span>
        </div>
        <strong>${money(product.price * item.qty)}</strong>
      </div>`;
  }).join("") + `
    <div class="order-total">
      <span>Total</span>
      <strong>${money(cartTotal())}</strong>
    </div>`;

  form.dataset.ready = "true";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const currentCart = getCart();
    const orderLines = currentCart.map((item) => {
      const product = PRODUCTS.find((entry) => entry.id === item.id);
      return `${product.name} × ${item.qty} — ${money(product.price * item.qty)}`;
    }).join("\n");

    const message = [
      "DRAGON PREMIUM WATCHES — NEW ORDER",
      "",
      `Name: ${data.get("name")}`,
      `Phone: ${data.get("phone")}`,
      `Governorate: ${data.get("governorate")}`,
      `Address: ${data.get("address")}`,
      `Notes: ${data.get("notes") || "—"}`,
      "",
      "ORDER DETAILS:",
      orderLines,
      "",
      `TOTAL: ${money(cartTotal())}`,
      "",
      "Sent from Dragon Premium Watches website."
    ].join("\n");

    // Instagram does not expose a public URL that can silently send a DM from a static site.
    // The reliable no-backend flow is: copy the exact message, open the brand DM, paste and send.
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      window.prompt("Copy this order message, then paste it into the Dragon Instagram DM:", message);
    }

    localStorage.removeItem(CART_KEY);
    refreshCartUI();

    const success = document.querySelector("[data-order-success]");
    if (success) success.classList.add("show");

    showToast("Order copied — opening Dragon Instagram");

  // Open the exact Instagram DM after the order is copied.
setTimeout(() => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Desktop: open the DM in Instagram Web.
  if (!isMobile) {
    window.location.assign(INSTAGRAM_DM_WEB);
    return;
  }

  // Mobile: try to open the exact DM inside the Instagram app.
  let appOpened = false;

  const onVisibilityChange = () => {
    if (document.hidden) {
      appOpened = true;
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );
    }
  };

  document.addEventListener(
    "visibilitychange",
    onVisibilityChange
  );

  // Try opening the Instagram app.
  window.location.href = INSTAGRAM_DM_APP;

  // If Instagram did not open, fall back to the web DM.
  setTimeout(() => {
    document.removeEventListener(
      "visibilitychange",
      onVisibilityChange
    );

    if (!appOpened && !document.hidden) {
      window.location.assign(INSTAGRAM_DM_WEB);
    }
  }, 1800);
}, 350);
});
}
// Start the application after the document is available.
document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupCart();
  setupMobileMenu();
  loadProducts();

  const filter = document.querySelector("[data-filter]");
  filter?.addEventListener("change", renderProductsGrid);

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
});
