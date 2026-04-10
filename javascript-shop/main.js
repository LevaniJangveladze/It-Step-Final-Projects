let images = ["./images/blue laptop 1.jpg", "./images/samsung 1.jpg", "./images/smartwatch.jpg"];
let i = 0;

setInterval(() => {
  i++;
  if (i >= images.length) i = 0;
  document.getElementById("slider").src = images[i];
}, 5000);


let bestsellers = document.getElementById("bestsellers");

function getAll() {
  fetch("https://api.everrest.educata.dev/shop/products/all?page_size=38")
    .then(response => response.json())
    .then(data => {
      bestsellers.innerHTML = "";

      const sortedProducts = data.products.sort((a, b) => b.rating - a.rating);

      for (let i = 0; i < 6; i++) {
        bestsellers.innerHTML += card(sortedProducts[i]);
      }
    });
}

getAll();




function card(product) {
  const fullStars = Math.round(product.rating);
  let starsHTML = "";
  for (let i = 1; i <= 5; i++) {
    starsHTML += i <= fullStars ? "★" : "☆";
  }

  const outOfStock = product.stock <= 0;

  return `
    <div class="card" onclick="window.location.href='inside-product.html?id=${product._id}'">

      <div class="card__price">${product.price.current}$</div>

      <div class="card__image-wrapper">
        <img class="card__image" src="${product.images?.[0] || product.thumbnail || ""}" referrerpolicy="no-referrer" alt="${product.title}">
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