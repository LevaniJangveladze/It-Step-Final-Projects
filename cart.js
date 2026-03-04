// ================= ELEMENTS =================

const cartBtn = document.getElementById("cart-btn");
const cartDrawer = document.getElementById("cart-drawer");
const closeCart = document.getElementById("close-cart");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");

// BASE_URL is declared in auth.js — do not redeclare here

// ================= INIT =================

document.addEventListener("DOMContentLoaded", () => {
  setupCartEvents();
  loadCart();
});

// ================= TOKEN =================

function getToken() {
  return localStorage.getItem("accessToken");
}

// ================= AUTH FETCH =================

async function authFetch(url, options = {}) {
  const token = getToken();

 if (!token) {
  const overlay = document.getElementById("auth-overlay");
  const signupForm = document.getElementById("signup-form");
  const loginWrapper = document.querySelector(".login-wrapper");

  signupForm.style.display = "none";
  loginWrapper.style.display = "flex";
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  return null;
}

  options.headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers
  };

  return fetch(url, options);
}

// ================= EVENTS =================

function setupCartEvents() {
  cartBtn?.addEventListener("click", () => {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("show");
  });

  closeCart?.addEventListener("click", closeCartDrawer);
  cartOverlay?.addEventListener("click", closeCartDrawer);
}

function closeCartDrawer() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("show");
}

// ================= LOAD CART =================

async function loadCart() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await authFetch(`${BASE_URL}/shop/cart`);

    if (!res || res.status === 409) {
      renderCart([]);
      return;
    }

    if (!res.ok) {
      console.warn("Cart load failed:", res.status);
      return;
    }

    const data = await res.json();
    const cartItems = data.products || [];

    const enrichedItems = await Promise.all(
      cartItems.map(async (item) => {
        try {
          const productRes = await fetch(`${BASE_URL}/shop/products/id/${item.productId}`);
          const product = productRes.ok ? await productRes.json() : null;
          return { ...item, product };
        } catch {
          return { ...item, product: null };
        }
      })
    );

    renderCart(enrichedItems, data.total);

  } catch (error) {
    console.error("Cart load error:", error);
  }
}

// ================= RENDER =================

function renderCart(products, total) {
  cartItemsContainer.innerHTML = "";

  if (!products.length) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty</p>";
    cartTotal.textContent = "$0";
    cartCount.textContent = "0";
    return;
  }

  let count = 0;

  products.forEach(item => {
    if (!item.product) return;

    const price = item.pricePerQuantity || 0;
    const quantity = item.quantity;
    count += quantity;

    cartItemsContainer.innerHTML += 
    cartItemsContainer.innerHTML += `
  <div class="cart-item">
    <img
      src="${item.product.thumbnail}"
      referrerpolicy="no-referrer"
      alt="${item.product.title}"
    >
    <div class="cart-info">
      <p>${item.product.title}</p>
      <p>$${price}</p>
    </div>
    <div class="cart-controls">
      <div class="cart-quantity">
        <button onclick="updateQuantity('${item.productId}', ${quantity - 1})">−</button>
        <span>${quantity}</span>
        <button onclick="updateQuantity('${item.productId}', ${quantity + 1})">+</button>
      </div>
      <button class="remove-btn" onclick="removeFromCart('${item.productId}')">Remove</button>
    </div>
  </div>
`;
  });

  cartTotal.textContent = `$${(total?.price?.current || 0).toLocaleString()}`;
  cartCount.textContent = count;
}

// ================= ADD =================

window.addToCart = async function(productId) {
  const token = getToken();
  if (!token) {
  const overlay = document.getElementById("auth-overlay");
  const signupForm = document.getElementById("signup-form");
  const loginWrapper = document.querySelector(".login-wrapper");

  signupForm.style.display = "none";
  loginWrapper.style.display = "flex";
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  return;
}

  let res = await authFetch(`${BASE_URL}/shop/cart/product`, {
    method: "POST",
    body: JSON.stringify({ id: productId, quantity: 1 })
  });

  if (res && res.status === 400) {
    const err = await res.json().catch(() => ({}));

    if (err.errorKeys?.includes("errors.already_in_cart") ||
        err.error?.includes("use patch endpoint")) {

      const cartRes = await authFetch(`${BASE_URL}/shop/cart`);
      const cartData = cartRes?.ok ? await cartRes.json() : null;
      const existing = cartData?.products?.find(p => p.productId === productId);
      const newQty = (existing?.quantity || 1) + 1;

      res = await authFetch(`${BASE_URL}/shop/cart/product`, {
        method: "PATCH",
        body: JSON.stringify({ id: productId, quantity: newQty })
      });

    } else {
      console.error(err);
      alert("Add to cart failed.");
      return;
    }
  }

  if (!res || !res.ok) {
    alert("Add to cart failed.");
    return;
  }

  await loadCart();
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("show");
};

// ================= UPDATE QUANTITY =================

window.updateQuantity = async function(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const res = await authFetch(`${BASE_URL}/shop/cart/product`, {
    method: "PATCH",
    body: JSON.stringify({ id: productId, quantity })
  });

  if (!res || !res.ok) {
    alert("Update failed");
    return;
  }

  loadCart();
};

// ================= REMOVE =================

window.removeFromCart = async function(productId) {
  const res = await authFetch(`${BASE_URL}/shop/cart/product`, {
    method: "DELETE",
    body: JSON.stringify({ id: productId })
  });

  if (!res || !res.ok) {
    alert("Remove failed");
    return;
  }

  loadCart();
};