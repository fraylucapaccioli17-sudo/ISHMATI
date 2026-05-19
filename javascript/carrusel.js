let index = 0;
let images = document.querySelectorAll(".carousel img");

setInterval(() => {
    images[index].classList.remove("active");
    index = (index + 1) % images.length;
    images[index].classList.add("active");
}, 3000);