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

  
  const hasDiscount = product.price.beforeDiscount > product.price.current;
  const discountPercent = hasDiscount
    ? Math.round(100 - (product.price.current / product.price.beforeDiscount) * 100)
    : 0;

  
  const mainImageSrc = product.images?.[0] || product.thumbnail || "";

 
  const categoryName = product.category?.name || "N/A";

  
  const showArrows = product.images?.length > 1;

  container.innerHTML = `
    <div class="product-wrapper">

      <div class="product-gallery">
        ${showArrows ? `<button class="prev">←</button>` : ""}
        <img id="mainImage" src="${mainImageSrc}" referrerpolicy="no-referrer" />
        ${showArrows ? `<button class="next">→</button>` : ""}

        ${hasDiscount ? `
          <div class="discount-badge">-${discountPercent}%</div>
        ` : ""}
      </div>

      <div class="product-info">
        <h1>${product.title}</h1>

        <div class="price">
          <span class="current">${product.price.current}$</span>
          ${hasDiscount
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
          <li>Category: ${categoryName}</li>
          <li>Brand: ${product.brand}</li>
        </ul>

        <button
          class="add-to-cart ${outOfStock ? "disabled" : ""}"
          ${outOfStock ? "disabled" : ""}
          onclick="${outOfStock ? "" : `addToCart('${product._id}')`}">
          ${outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

    </div>
  `;

  if (showArrows) {
    initCarousel(product.images);
  }
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