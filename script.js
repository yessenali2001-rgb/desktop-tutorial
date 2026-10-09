// Mobile menu toggle
const menuButton = document.querySelector(".menu-btn");
const links = document.querySelector(".links");

menuButton.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

links.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    links.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});
