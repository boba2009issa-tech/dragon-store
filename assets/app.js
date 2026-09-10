const CART_KEY = "dragon_cart_v1";

// Official Instagram profile
const INSTAGRAM_PROFILE = "https://www.instagram.com/drago__n1_/";

// Exact Instagram DM
const INSTAGRAM_DM_WEB =
  "https://www.instagram.com/direct/t/17845443282150287/";

// Instagram mobile DM deep link
const INSTAGRAM_DM_APP =
  "instagram://direct/t/17845443282150287/";

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
  return getCart().reduce(
    (total, item) => total + item.qty,
    0
  );
}

// Update the small cart badge in every page header.
function updateCartCount() {
  const count = cartCount();

  document
    .querySelectorAll("[data-cart-count]")
    .forEach((element) => {
      element.textContent = count;
      element.classList.toggle(
        "hidden",
        count === 0
      );
    });
}

// Add one unit of a product to the cart.
function addToCart(id) {
  const product = PRODUCTS.find(
    (item) => item.id === id
  );

  if (!product) return;

  const cart = getCart();

  const existing = cart.find(
    (item) => item.id === id
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id,
      qty: 1
    });
  }

  saveCart(cart);

  showToast(
    `${product.name} added to cart`
  );
}

// Set an exact quantity for one product.
function setQty(id, quantity) {
  const cart = getCart();

  const item = cart.find(
    (entry) => entry.id === id
  );

  const nextQuantity = Math.max(
    0,
    Number(quantity)
  );

  // A plus button on a product with quantity 0 should create the cart line.
  if (!item) {
    if (nextQuantity > 0) {
      cart.push({
        id,
        qty: nextQuantity
      });
    }

    saveCart(cart);
    return;
  }

  item.qty = nextQuantity;

  saveCart(
    cart.filter(
      (entry) => entry.qty > 0
    )
  );
}

// Remove a product completely from the cart.
function removeItem(id) {
  saveCart(
    getCart().filter(
      (item) => item.id !== id
    )
  );
}

// Calculate the current cart subtotal from the product catalog.
function cartTotal() {
  return getCart().reduce(
    (total, item) => {
      const product = PRODUCTS.find(
        (entry) => entry.id === item.id
      );

      return (
        total +
        (
          product
            ? product.price * item.qty
            : 0
        )
      );
    },
    0
  );
}

// Return the quantity of a specific product in the cart.
function getQty(id) {
  return (
    getCart().find(
      (item) => item.id === id
    )?.qty || 0
  );
}

// Render the cart drawer contents.
function renderCart() {
  const container =
    document.querySelector(
      "[data-cart-items]"
    );

  if (!container) return;

  const cart = getCart();

  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">

        <div class="cart-empty-icon">
          🛒
        </div>

        <h3>
          Your cart is empty
        </h3>

        <p>
          Choose a timepiece and build your selection.
        </p>

        <a
          href="products.html"
          class="cart-empty-link"
        >
          Explore collection
        </a>

      </div>
    `;
  } else {
    container.innerHTML = cart
      .map((item) => {

        const product =
          PRODUCTS.find(
            (entry) =>
              entry.id === item.id
          );

        if (!product) return "";

        return `
          <article class="cart-item">

            <img
              src="${product.image}"
              alt="${product.name}"
              loading="lazy"
              decoding="async"
            >

            <div class="cart-item-info">

              <div class="cart-item-category">
                ${product.category}
              </div>

              <h3>
                ${product.name}
              </h3>

              <p>
                ${money(product.price)}
              </p>

              <div
                class="quantity"
                aria-label="Quantity for ${product.name}"
              >

                <button
                  type="button"
                  aria-label="Decrease ${product.name}"
                  onclick="setQty(
                    '${product.id}',
                    ${item.qty - 1}
                  )"
                >
                  −
                </button>

                <span>
                  ${item.qty}
                </span>

                <button
                  type="button"
                  aria-label="Increase ${product.name}"
                  onclick="setQty(
                    '${product.id}',
                    ${item.qty + 1}
                  )"
                >
                  +
                </button>

              </div>

            </div>

            <button
              class="remove-item"
              type="button"
              aria-label="Remove ${product.name}"
              onclick="removeItem('${product.id}')"
            >
              Remove
            </button>

          </article>
        `;
      })
      .join("");
  }

  document
    .querySelectorAll(
      "[data-cart-total]"
    )
    .forEach((element) => {
      element.textContent =
        money(cartTotal());
    });
}

// Refresh the cart drawer, badge, product quantities and checkout button state.
function refreshCartUI() {
  renderCart();
  updateCartCount();
  renderProductQuantities();
  updateCheckoutButton();
}

// Disable checkout when the cart is empty.
function updateCheckoutButton() {
  const button =
    document.querySelector(
      "[data-checkout-link]"
    );

  if (!button) return;

  const hasItems =
    getCart().length > 0;

  button.classList.toggle(
    "is-disabled",
    !hasItems
  );

  button.setAttribute(
    "aria-disabled",
    String(!hasItems)
  );

  button.href = hasItems
    ? "checkout.html"
    : "products.html";
}

// Open the cart drawer and lock page scrolling.
function openCart() {
  document
    .querySelector("[data-cart]")
    ?.classList.add("open");

  document
    .querySelector(
      "[data-cart-overlay]"
    )
    ?.classList.add("open");

  document.body.classList.add(
    "cart-is-open"
  );
}

// Close the cart drawer and restore page scrolling.
function closeCart() {
  document
    .querySelector("[data-cart]")
    ?.classList.remove("open");

  document
    .querySelector(
      "[data-cart-overlay]"
    )
    ?.classList.remove("open");

  document.body.classList.remove(
    "cart-is-open"
  );
}

// Show a small non-blocking status message.
function showToast(message) {
  const toast =
    document.querySelector(
      "[data-toast]"
    );

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(
    window.__dragonToast
  );

  window.__dragonToast =
    setTimeout(() => {
      toast.classList.remove(
        "show"
      );
    }, 2600);
}

// Keep product-card quantity controls synchronized with localStorage.
function renderProductQuantities() {
  document
    .querySelectorAll(
      "[data-product-id]"
    )
    .forEach((card) => {

      const id =
        card.dataset.productId;

      const quantity =
        getQty(id);

      const number =
        card.querySelector(
          ".quantity span"
        );

      const minus =
        card.querySelector(
          ".quantity button:first-child"
        );

      const plus =
        card.querySelector(
          ".quantity button:last-child"
        );

      if (number) {
        number.textContent =
          quantity;
      }

      if (minus) {
        minus.onclick = () => {
          setQty(
            id,
            quantity - 1
          );
        };
      }

      if (plus) {
        plus.onclick = () => {
          setQty(
            id,
            quantity + 1
          );
        };
      }
    });
}

// Build one clean product card.
function productCard(product) {
  const quantity =
    getQty(product.id);

  return `
    <article
      class="product-card reveal"
      data-product-id="${product.id}"
    >

      <a
        href="products.html#${product.id}"
        class="product-media"
      >

        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          decoding="async"
        >

        <span class="product-badge">
          ${product.badge}
        </span>

      </a>

      <div class="product-info">

        <div class="product-topline">

          <div>

            <div class="product-category">
              ${product.category}
            </div>

            <h3>
              ${product.name}
            </h3>

          </div>

          <div
            class="quantity"
            aria-label="Quantity for ${product.name}"
          >

            <button
              type="button"
              aria-label="Decrease ${product.name}"
              onclick="setQty(
                '${product.id}',
                ${quantity - 1}
              )"
            >
              −
            </button>

            <span>
              ${quantity}
            </span>

            <button
              type="button"
              aria-label="Increase ${product.name}"
              onclick="setQty(
                '${product.id}',
                ${quantity + 1}
              )"
            >
              +
            </button>

          </div>

        </div>

        <p class="product-description">
          ${product.description}
        </p>

        <div class="product-bottomline">

          <div>

            <strong>
              ${money(product.price)}
            </strong>

            <span>
              ${money(product.oldPrice)}
            </span>

          </div>

          <button
            class="add-to-cart"
            type="button"
            onclick="addToCart('${product.id}')"
          >
            Add to cart
          </button>

        </div>

      </div>

    </article>
  `;
}

// Load the JSON catalog.
async function loadProducts() {
  try {

    const response =
      await fetch(
        "assets/products.json",
        {
          cache: "no-store"
        }
      );

    PRODUCTS =
      await response.json();

    renderCart();

    updateCartCount();

    updateCheckoutButton();

    const featured =
      document.querySelector(
        "[data-featured]"
      );

    if (featured) {
      featured.innerHTML =
        PRODUCTS
          .slice(0, 3)
          .map(productCard)
          .join("");
    }

    if (
      document.querySelector(
        "[data-products-grid]"
      )
    ) {
      renderProductsGrid();
    }

    document
      .querySelectorAll(
        "[data-product-select]"
      )
      .forEach((select) => {

        select.innerHTML = `
          <option value="">
            Select a piece
          </option>

          ${PRODUCTS
            .map(
              (product) => `
                <option
                  value="${product.id}"
                >
                  ${product.name} —
                  ${money(product.price)}
                </option>
              `
            )
            .join("")}
        `;
      });

    setupCheckout();

    observeReveals();

  } catch (error) {

    console.error(
      "Dragon catalog failed to load:",
      error
    );

  }
}

// Render the collection page using the selected category.
function renderProductsGrid() {
  const grid =
    document.querySelector(
      "[data-products-grid]"
    );

  if (!grid) return;

  const category =
    document.querySelector(
      "[data-filter]"
    )?.value || "All";

  const products =
    category === "All"
      ? PRODUCTS
      : PRODUCTS.filter(
          (product) =>
            product.category ===
            category
        );

  grid.innerHTML =
    products
      .map(productCard)
      .join("");

  const resultCount =
    document.querySelector(
      "[data-result-count]"
    );

  if (resultCount) {
    resultCount.textContent =
      `${products.length} pieces`;
  }

  observeReveals();
}

// Highlight the current desktop navigation item.
function setupNav() {
  const page =
    document.body.dataset.page;

  document
    .querySelectorAll(
      "[data-nav]"
    )
    .forEach((link) => {

      link.classList.toggle(
        "active",
        link.dataset.nav === page
      );

    });
}

// Add reveal-on-scroll.
function observeReveals() {
  const elements =
    document.querySelectorAll(
      ".reveal:not(.in)"
    );

  if (
    !(
      "IntersectionObserver" in
      window
    )
  ) {

    elements.forEach(
      (element) => {
        element.classList.add(
          "in"
        );
      }
    );

    return;
  }

  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(
          (entry) => {

            if (
              !entry.isIntersecting
            ) {
              return;
            }

            entry.target.classList.add(
              "in"
            );

            observer.unobserve(
              entry.target
            );

          }
        );

      },
      {
        threshold: 0.1
      }
    );

  elements.forEach(
    (element) => {
      observer.observe(element);
    }
  );
}

// Wire the cart drawer controls.
function setupCart() {
  document
    .querySelectorAll(
      "[data-open-cart]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        openCart
      );

    });

  document
    .querySelectorAll(
      "[data-close-cart]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        closeCart
      );

    });

  document
    .querySelector(
      "[data-cart-overlay]"
    )
    ?.addEventListener(
      "click",
      closeCart
    );

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape"
      ) {

        closeCart();
        closeMobileMenu();

      }

    }
  );
}

// Toggle the mobile navigation drawer.
function toggleMobileMenu() {
  const menu =
    document.querySelector(
      "[data-mobile-menu]"
    );

  const button =
    document.querySelector(
      "[data-mobile-menu-button]"
    );

  if (!menu || !button) {
    return;
  }

  const isOpen =
    menu.classList.toggle(
      "open"
    );

  button.setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  document.body.classList.toggle(
    "menu-is-open",
    isOpen
  );
}

// Close the mobile navigation drawer.
function closeMobileMenu() {
  const menu =
    document.querySelector(
      "[data-mobile-menu]"
    );

  const button =
    document.querySelector(
      "[data-mobile-menu-button]"
    );

  if (!menu || !button) {
    return;
  }

  menu.classList.remove(
    "open"
  );

  button.setAttribute(
    "aria-expanded",
    "false"
  );

  document.body.classList.remove(
    "menu-is-open"
  );
}

// Initialize mobile navigation.
function setupMobileMenu() {
  document
    .querySelector(
      "[data-mobile-menu-button]"
    )
    ?.addEventListener(
      "click",
      toggleMobileMenu
    );

  document
    .querySelectorAll(
      "[data-mobile-link]"
    )
    .forEach((link) => {

      link.addEventListener(
        "click",
        closeMobileMenu
      );

    });
}

// Open the Dragon Instagram DM from a real user interaction.
function openDragonInstagramDM() {
  const userAgent =
    navigator.userAgent || "";

  const isAndroid =
    /Android/i.test(userAgent);

  const isIOS =
    /iPhone|iPad|iPod/i.test(
      userAgent
    );

  /*
   * Android:
   * Try to hand the exact DM URL
   * directly to the Instagram app.
   */
  if (isAndroid) {

    const androidIntent =
      "intent://direct/t/17845443282150287/" +
      "#Intent;scheme=https;" +
      "package=com.instagram.android;" +
      "end";

    window.location.href =
      androidIntent;

    /*
     * If Instagram does not take over,
     * fall back to the normal web DM.
     */
    setTimeout(() => {

      if (
        document.visibilityState ===
        "visible"
      ) {

        window.location.href =
          INSTAGRAM_DM_WEB;

      }

    }, 1500);

    return;
  }

  /*
   * iPhone / iPad:
   * Try Instagram's native URL scheme.
   */
  if (isIOS) {

    let appOpened = false;

    const handleVisibility =
      () => {

        if (
          document.visibilityState ===
          "hidden"
        ) {
          appOpened = true;
        }

      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility,
      {
        once: true
      }
    );

    window.location.href =
      INSTAGRAM_DM_APP;

    /*
     * Fallback to the web DM
     * if the app scheme was not handled.
     */
    setTimeout(() => {

      if (
        !appOpened &&
        document.visibilityState ===
          "visible"
      ) {

        window.location.href =
          INSTAGRAM_DM_WEB;

      }

    }, 1500);

    return;
  }

  /*
   * Desktop:
   * Open the exact web DM.
   */
  window.location.assign(
    INSTAGRAM_DM_WEB
  );
}

// Render checkout and prepare the Instagram DM message.
function setupCheckout() {
  const form =
    document.querySelector(
      "[data-order-form]"
    );

  if (
    !form ||
    form.dataset.ready ===
      "true"
  ) {
    return;
  }

  const cart = getCart();

  const emptyState =
    document.querySelector(
      "[data-checkout-empty]"
    );

  if (!cart.length) {

    emptyState?.classList.remove(
      "hidden"
    );

    form.classList.add(
      "hidden"
    );

    return;
  }

  const summary =
    document.querySelector(
      "[data-order-summary]"
    );

  if (!summary) return;

  summary.innerHTML =
    cart
      .map((item) => {

        const product =
          PRODUCTS.find(
            (entry) =>
              entry.id ===
              item.id
          );

        if (!product) {
          return "";
        }

        return `
          <div class="order-line">

            <div>

              <strong>
                ${product.name}
              </strong>

              <span>
                Qty ${item.qty}
              </span>

            </div>

            <strong>
              ${money(
                product.price *
                item.qty
              )}
            </strong>

          </div>
        `;

      })
      .join("") +
    `
      <div class="order-total">

        <span>
          Total
        </span>

        <strong>
          ${money(cartTotal())}
        </strong>

      </div>
    `;

  form.dataset.ready =
    "true";

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const data =
        new FormData(form);

      const currentCart =
        getCart();

      const orderLines =
        currentCart
          .map((item) => {

            const product =
              PRODUCTS.find(
                (entry) =>
                  entry.id ===
                  item.id
              );

            if (!product) {
              return "";
            }

            return (
              `${product.name} × ` +
              `${item.qty} — ` +
              `${money(
                product.price *
                item.qty
              )}`
            );

          })
          .filter(Boolean)
          .join("\n");

      const message = [
        "DRAGON PREMIUM WATCHES — NEW ORDER",
        "",
        `Name: ${data.get("name")}`,
        `Phone: ${data.get("phone")}`,
        `Governorate: ${data.get("governorate")}`,
        `Address: ${data.get("address")}`,
        `Notes: ${
          data.get("notes") || "—"
        }`,
        "",
        "ORDER DETAILS:",
        orderLines,
        "",
        `TOTAL: ${money(cartTotal())}`,
        "",
        "Sent from Dragon Premium Watches website."
      ].join("\n");

      // Copy the complete order message.
      try {

        await navigator.clipboard.writeText(
          message
        );

      } catch {

        window.prompt(
          "Copy this order message, then paste it into the Dragon Instagram DM:",
          message
        );

      }

      // Clear the cart after preparing the order.
      localStorage.removeItem(
        CART_KEY
      );

      refreshCartUI();

      // Show the existing desktop success state.
      const success =
        document.querySelector(
          "[data-order-success]"
        );

      if (success) {

        success.classList.add(
          "show"
        );

      }

      // Detect mobile devices.
      const isMobile =
        /Android|iPhone|iPad|iPod/i.test(
          navigator.userAgent
        );

      // DESKTOP
      // Open the exact Instagram DM.
      if (!isMobile) {

        showToast(
          "Order copied — opening Dragon DM"
        );

        setTimeout(() => {

          window.location.assign(
            INSTAGRAM_DM_WEB
          );

        }, 350);

        return;
      }

      // MOBILE
      // Show the order-ready panel.
      showMobileOrderSuccess(
        message
      );

    }
  );
}

// Show the mobile order-success panel.
function showMobileOrderSuccess(
  message
) {

  let panel =
    document.querySelector(
      "[data-mobile-order-success]"
    );

  if (!panel) {

    panel =
      document.createElement(
        "div"
      );

    panel.setAttribute(
      "data-mobile-order-success",
      "true"
    );

    panel.innerHTML = `

      <div
        class="dragon-mobile-success-backdrop"
        data-mobile-success-close
      ></div>

      <section
        class="dragon-mobile-success"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dragon-mobile-success-title"
      >

        <button
          class="dragon-mobile-success-close"
          type="button"
          aria-label="Close"
          data-mobile-success-close
        >
          ×
        </button>

        <div class="dragon-mobile-success-icon">
          ✓
        </div>

        <div class="dragon-mobile-success-eyebrow">
          ORDER READY
        </div>

        <h2
          id="dragon-mobile-success-title"
        >
          Your order is ready
        </h2>

        <p>
          Your order details have been copied.
          Tap below to open the Dragon Instagram DM.
        </p>

        <button
          class="dragon-mobile-success-primary"
          type="button"
          data-open-instagram
        >
          Open Dragon DM
        </button>

        <button
          class="dragon-mobile-success-secondary"
          type="button"
          data-copy-order
        >
          Copy Order Again
        </button>

        <button
          class="dragon-mobile-success-link"
          type="button"
          data-mobile-success-close
        >
          Close
        </button>

      </section>
    `;

    const style =
      document.createElement(
        "style"
      );

    style.textContent = `

      [data-mobile-order-success] {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: end center;
      }

      .dragon-mobile-success-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.72);
        backdrop-filter: blur(7px);
      }

      .dragon-mobile-success {
        position: relative;
        width: min(100%, 520px);
        margin: 12px;
        padding: 30px 22px 24px;
        border: 1px solid rgba(212, 175, 55, 0.28);
        border-radius: 24px;
        background: #07101f;
        color: #fff;
        box-shadow:
          0 24px 80px rgba(0, 0, 0, 0.55);
        text-align: center;
        animation:
          dragonMobileSuccessIn
          0.28s ease-out;
      }

      .dragon-mobile-success-icon {
        width: 52px;
        height: 52px;
        margin: 0 auto 14px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        border: 1px solid rgba(212, 175, 55, 0.55);
        color: #d4af37;
        font-size: 25px;
      }

      .dragon-mobile-success-eyebrow {
        color: #d4af37;
        font-size: 11px;
        letter-spacing: 0.22em;
        font-weight: 700;
      }

      .dragon-mobile-success h2 {
        margin: 7px 0 9px;
        font-size: 26px;
        line-height: 1.15;
      }

      .dragon-mobile-success p {
        margin: 0 auto 20px;
        max-width: 410px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 14px;
        line-height: 1.65;
      }

      .dragon-mobile-success-primary,
      .dragon-mobile-success-secondary {
        width: 100%;
        min-height: 52px;
        border-radius: 13px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .dragon-mobile-success-primary {
        border: 1px solid #d4af37;
        background: #d4af37;
        color: #07101f;
      }

      .dragon-mobile-success-secondary {
        margin-top: 9px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
      }

      .dragon-mobile-success-link {
        margin-top: 13px;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.55);
        font: inherit;
        cursor: pointer;
      }

      .dragon-mobile-success-close {
        position: absolute;
        top: 12px;
        right: 14px;
        width: 36px;
        height: 36px;
        border: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.75);
        font-size: 25px;
        cursor: pointer;
      }

      @keyframes dragonMobileSuccessIn {

        from {
          transform: translateY(18px);
          opacity: 0;
        }

        to {
          transform: translateY(0);
          opacity: 1;
        }

      }

      @media (min-width: 700px) {

        [data-mobile-order-success] {
          display: none !important;
        }

      }

    `;

    document.head.appendChild(
      style
    );

    document.body.appendChild(
      panel
    );

    // Close the mobile success panel.
    panel
      .querySelectorAll(
        "[data-mobile-success-close]"
      )
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {
            panel.remove();
          }
        );

      });

    // Copy the order again.
    panel
      .querySelector(
        "[data-copy-order]"
      )
      ?.addEventListener(
        "click",
        async () => {

          try {

            await navigator.clipboard.writeText(
              message
            );

            showToast(
              "Order copied again"
            );

          } catch {

            window.prompt(
              "Copy your order message:",
              message
            );

          }

        }
      );

    // Open the Dragon Instagram DM.
    panel
      .querySelector(
        "[data-open-instagram]"
      )
      ?.addEventListener(
        "click",
        () => {

          /*
           * The button is clicked directly
           * by the customer.
           *
           * This gives the browser permission
           * to attempt the Instagram app
           * deep-link.
           */

          openDragonInstagramDM();

        }
      );
  }
}

// Start the application after the document is available.
document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupNav();

    setupCart();

    setupMobileMenu();

    loadProducts();

    const filter =
      document.querySelector(
        "[data-filter]"
      );

    filter?.addEventListener(
      "change",
      renderProductsGrid
    );

    document
      .querySelectorAll(
        "[data-year]"
      )
      .forEach((element) => {

        element.textContent =
          new Date().getFullYear();

      });

  }
);
