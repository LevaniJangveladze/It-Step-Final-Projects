const container = document.getElementById("productContainer");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function fetchProduct() {
  if (!productId) {
    container.innerHTML = "<h2>No product ID found</h2>";
    return;
  }

  try {
    const response = await fetch(
      `https://api.everrest.educata.dev/shop/products/id/${productId}`
    );

    if (!response.ok) throw new Error("Product not found");

    const product = await response.json();
    renderProduct(product);

  } catch (error) {
    console.log(error);
    container.innerHTML = "<h2>Product not found</h2>";
  }
}

fetchProduct();

function renderProduct(product) {
  const outOfStock = product.stock <= 0;

  container.innerHTML = `
    <div class="product-wrapper">

      <div class="product-gallery">
        <button class="prev">←</button>
        <img id="mainImage" src="${product.images[0]}" referrerpolicy="no-referrer" />
        <button class="next">→</button>

        ${product.price.beforeDiscount ? `
          <div class="discount-badge">
            ${Math.round(100 - (product.price.current / product.price.beforeDiscount) * 100)}%
          </div>
        ` : ""}
      </div>

      <div class="product-info">
        <h1>${product.title}</h1>

        <div class="price">
          <span class="current">${product.price.current}$</span>
          ${product.price.beforeDiscount
            ? `<span class="old-price">${product.price.beforeDiscount}$</span>`
            : ""}
        </div>

        <div class="rating">
          <span class="stars">${generateStars(product.rating)}</span>
          <span class="rating-number">${product.rating?.toFixed(1) || "0.0"}</span>
        </div>

        <div class="stock ${outOfStock ? "out" : "in"}">
          ${outOfStock ? "✖ Out of Stock" : "✔ In Stock"}
        </div>

        <p class="product-desc">Product Description</p>
        <hr>
        <p>${product.description}</p>

        <div class="features">
          <div class="feature"><span>📅</span><p>3 Year full warranty</p></div>
          <div class="feature"><span>💳</span><p>Secure payment</p></div>
          <div class="feature"><span>🚚</span><p>Worldwide shipping</p></div>
        </div>

        <ul>
          <li>Category: ${product.category.name}</li>
          <li>Brand: ${product.brand}</li>
        </ul>

        <!-- ✅ FIX: added onclick and disabled state for out-of-stock -->
        <button
          class="add-to-cart ${outOfStock ? "disabled" : ""}"
          ${outOfStock ? "disabled" : ""}
          onclick="${outOfStock ? "" : `addToCart('${product._id}')`}">
          ${outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

    </div>
  `;

  initCarousel(product.images);
}

function generateStars(rating) {
  const rounded = Math.round(rating || 0);
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += i <= rounded ? "★" : "☆";
  }
  return stars;
}

function initCarousel(images) {
  let currentIndex = 0;
  const mainImage = document.getElementById("mainImage");

  document.querySelector(".prev").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    mainImage.src = images[currentIndex];
  });

  document.querySelector(".next").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    mainImage.src = images[currentIndex];
  });
}