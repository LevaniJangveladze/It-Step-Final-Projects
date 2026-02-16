let images = ["3.avif", "7.avif", "9.avif"];
let i = 0;

setInterval(() => {
  i++;
  if (i >= images.length) i = 0;
  document.getElementById("slider").src = images[i];
}, 2000);


let bestseller = document.getElementById("bestsellers");

function getAll() {

fetch("https://api.everrest.educata.dev/shop/products/all")

.then(response => response.json())

.then(data => {

  for(let i = 0; i < 6; i++){

    bestseller.innerHTML += card(data.products[i]);

  }

});

}

getAll();



function card(product){

  return `
  
<div class="card" style="width: 18rem;">

  <img src="${product.images[0]}" class="card-img-top">

  <div class="card-body">

    <h5 class="card-title">${product.title}</h5>

    <p class="card-text">${product.price.current} $</p>

  </div>

</div>

  `;
}

