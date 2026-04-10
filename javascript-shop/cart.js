

const cartBtn = document.getElementById("cart-btn");
const cartDrawer = document.getElementById("cart-drawer");
const closeCart = document.getElementById("close-cart");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");

const mobileCartCount = document.getElementById("mobile-cart-count");



document.addEventListener("DOMContentLoaded", () => {
  setupCartEvents();
  loadCart();
});



function getToken() {
  return localStorage.getItem("accessToken");
}



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



function renderCart(products, total) {
  cartItemsContainer.innerHTML = "";

  if (!products.length) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty</p>";
    cartTotal.textContent = "$0";
    cartCount.textContent = "0";
    if (mobileCartCount) mobileCartCount.textContent = "0"; 
    return;
  }

  let count = 0;

  products.forEach(item => {
    if (!item.product) return;

    const price = item.pricePerQuantity || 0;
    const quantity = item.quantity;
    count += quantity;

    cartItemsContainer.innerHTML += `
  <div class="cart-item">
    <img
      src="${item.product.images?.[0] || item.product.thumbnail || ""}"
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
  if (mobileCartCount) mobileCartCount.textContent = count; 
}



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

      const cartRes = await authFetch(`${BASE_URL}/shop/cart?_=${Date.now()}`);
      const cartData = cartRes?.ok ? await cartRes.json() : null;
      const existing = cartData?.products?.find(p => p.productId === productId);
      const newQty = existing ? existing.quantity + 1 : 1;

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
    console.error("Update failed");
    return;
  }

  await loadCart();
};



window.removeFromCart = async function(productId) {
  const res = await authFetch(`${BASE_URL}/shop/cart/product`, {
    method: "DELETE",
    body: JSON.stringify({ id: productId })
  });

  if (!res || !res.ok) {
    console.error("Remove failed");
    return;
  }

  await loadCart();
};