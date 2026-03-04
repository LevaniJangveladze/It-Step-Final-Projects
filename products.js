let searchParams = {
  page_index: 1,
  page_size: 6,
  keywords: "",
  brand: "",
  category_id: "",
  rating: "",
  price_min: "",
  price_max: "",
  sort_by: "",
  sort_direction: ""
};

const allProductsContainer = document.getElementById("allProducts");
const brandList = document.getElementById("brandList");
const categoryList = document.getElementById("categoryList");
const ratingList = document.getElementById("ratingList");
const paginationContainer = document.getElementById("pagination");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const loaderWrapper = document.querySelector(".loader-wrapper");

let totalProducts = 0;

init();

async function init() {
  await loadBrands();
  await loadCategories();
  await fetchProductsWithSearch();
  displayRating();
}

// ================= FETCH PRODUCTS =================

async function fetchProductsWithSearch() {
  loaderWrapper.style.display = "flex";

  let filteredParams = {};
  for (let key in searchParams) {
    if (searchParams[key] !== "" && searchParams[key] !== null) {
      filteredParams[key] = searchParams[key];
    }
  }

  let query = new URLSearchParams(filteredParams).toString();

  try {
    const response = await fetch(
      `https://api.everrest.educata.dev/shop/products/search?${query}`
    );
    const data = await response.json();
    totalProducts = data.total || 0;
    displayProducts(data.products || []);
    buildPagination();
  } catch (error) {
    console.log(error);
  } finally {
    loaderWrapper.style.display = "none";
  }
}

// ================= PAGINATION =================

function buildPagination() {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(totalProducts / searchParams.page_size);

  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.innerHTML += `
      <button
        onclick="changePage(${i})"
        class="${i === searchParams.page_index ? "active-page" : ""}">
        ${i}
      </button>
    `;
  }
}

function changePage(page) {
  searchParams.page_index = page;
  fetchProductsWithSearch();
}

// ================= DISPLAY PRODUCTS =================

function displayProducts(productsArray) {
  allProductsContainer.innerHTML = "";

  if (productsArray.length === 0) {
    allProductsContainer.innerHTML = "<h2>No products found</h2>";
    return;
  }

  productsArray.forEach(product => {
    allProductsContainer.innerHTML += createCard(product);
  });
}

// ================= CREATE CARD =================

function createCard(product) {
  const rating = Math.round(product.rating || 0);

  let starsHTML = "";
  for (let i = 1; i <= 5; i++) {
    starsHTML += i <= rating ? "★" : "☆";
  }

  // ✅ FIX: use <= 0 to catch negative stock values like -5
  const outOfStock = product.stock <= 0;

  return `
  <div class="card" onclick="goToProduct('${product._id}')">

    <div class="card__price">
      ${product.price?.current || 0}$
    </div>

    <div class="card__image-wrapper">
      <img
        class="card__image"
        src="${product.images?.[0] || product.thumbnail || ""}"
        referrerpolicy="no-referrer"
        alt="${product.title}"
      >
    </div>

    <div class="card__body">
      <h3 class="card__title">${product.title}</h3>
      <div class="card__stars">${starsHTML}</div>

      <button
        class="card__btn ${outOfStock ? "card__btn--disabled" : ""}"
        ${outOfStock ? "disabled" : ""}
        onclick="event.stopPropagation(); ${outOfStock ? "" : `addToCart('${product._id}')`}">
        ${outOfStock ? "Out of Stock" : "ADD TO CART"}
      </button>
    </div>
  </div>
  `;
}

// ================= FILTERS =================

function filterByBrand(brand) {
  searchParams.brand = brand;
  searchParams.page_index = 1;
  fetchProductsWithSearch();
}

function filterByCategory(categoryId) {
  searchParams.category_id = categoryId;
  searchParams.page_index = 1;
  fetchProductsWithSearch();
}

function filterByRating(rating) {
  searchParams.rating = rating;
  searchParams.page_index = 1;
  fetchProductsWithSearch();
}

function filterByPrice() {
  searchParams.price_min = minPriceInput.value;
  searchParams.price_max = maxPriceInput.value;
  searchParams.page_index = 1;
  fetchProductsWithSearch();
}

function clearAllFilters() {
  searchParams = {
    page_index: 1,
    page_size: 6,
    keywords: "",
    brand: "",
    category_id: "",
    rating: "",
    price_min: "",
    price_max: "",
    sort_by: "",
    sort_direction: ""
  };
  fetchProductsWithSearch();
}

function getAllProducts() {
  clearAllFilters();
}

// ================= LOAD BRANDS =================

async function loadBrands() {
  const res = await fetch("https://api.everrest.educata.dev/shop/products/brands");
  const brands = await res.json();

  brandList.innerHTML = "";
  brands.forEach(brand => {
    brandList.innerHTML += `
      <div class="brand-item" onclick="filterByBrand('${brand}')">
        🏷 ${brand.toUpperCase()}
      </div>
    `;
  });
}

// ================= LOAD CATEGORIES =================

async function loadCategories() {
  const res = await fetch("https://api.everrest.educata.dev/shop/products/categories");
  const categories = await res.json();

  categoryList.innerHTML = "";
  categories.forEach(category => {
    categoryList.innerHTML += `
      <div class="category-item" onclick="filterByCategory('${category.id}')">
        📦 ${category.name.toUpperCase()}
      </div>
    `;
  });
}

// ================= RATING UI =================

function displayRating() {
  ratingList.innerHTML = "";

  for (let i = 5; i >= 1; i--) {
    let stars = "";
    for (let j = 1; j <= 5; j++) {
      stars += j <= i ? "★" : "☆";
    }
    ratingList.innerHTML += `
      <div class="rating-item" onclick="filterByRating(${i})">
        ${stars}
      </div>
    `;
  }
}

// ================= NAVIGATION =================

function goToProduct(id) {
  window.location.href = `inside-product.html?id=${id}`;
}

function changeProductsPerPage(value) {
  searchParams.page_size = value === "38" ? totalProducts : Number(value);
  searchParams.page_index = 1;
  fetchProductsWithSearch();
}

// ================= TOGGLES =================

function toggleCategory() {
  const el = document.getElementById("categoryList");
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function toggleBrands() {
  const el = document.getElementById("brandList");
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function toggleRating() {
  const el = document.getElementById("ratingList");
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function togglePrice() {
  const el = document.getElementById("priceFilter");
  el.style.display = el.style.display === "none" ? "block" : "none";
}

// ================= SMART SEARCH =================

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

if (searchInput && searchResults) {
  let debounceTimeout;

  searchInput.addEventListener("input", function () {
    clearTimeout(debounceTimeout);
    const value = this.value.trim();

    if (value.length < 2) {
      searchResults.style.display = "none";
      return;
    }

    debounceTimeout = setTimeout(() => {
      fetchSearchSuggestions(value);
    }, 300);
  });
}

async function fetchSearchSuggestions(keyword) {
  try {
    const res = await fetch(
      `https://api.everrest.educata.dev/shop/products/search?keywords=${keyword}&page_size=5`
    );
    const data = await res.json();
    renderSearchResults(data.products || []);
  } catch (error) {
    console.log(error);
  }
}

function renderSearchResults(products) {
  if (products.length === 0) {
    searchResults.style.display = "none";
    return;
  }

  searchResults.innerHTML = "";
  products.forEach(product => {
    searchResults.innerHTML += `
      <div class="search-item" onclick="goToProduct('${product._id}')">
        <img src="${product.images?.[0] || product.thumbnail || ""}" referrerpolicy="no-referrer">
        <span>${product.title}</span>
        <span class="search-item-price">${product.price?.current || 0}$</span>
      </div>
    `;
  });

  searchResults.style.display = "block";
}

document.addEventListener("click", function (e) {
  if (!document.querySelector(".search").contains(e.target)) {
    searchResults.style.display = "none";
  }
});

function changeSort(value) {
  if (!value) {
    searchParams.sort_by = "";
    searchParams.sort_direction = "";
  } else {
    const [field, direction] = value.split("_");
    searchParams.sort_by = field;
    searchParams.sort_direction = direction;
  }
  searchParams.page_index = 1;
  fetchProductsWithSearch();
}