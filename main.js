let images = ["3.avif", "7.avif", "9.avif"];
let i = 0;

setInterval(() => {
  i++;
  if (i >= images.length) i = 0;
  document.getElementById("slider").src = images[i];
}, 2000);
