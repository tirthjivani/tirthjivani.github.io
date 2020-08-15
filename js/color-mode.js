const btn = document.querySelector(".dark");
const currentTheme = localStorage.getItem("theme");

if (currentTheme == "dark") {
  document.body.classList.add("dark-theme");
  btn.innerHTML = '<i class="fas fa-sun fa-2x" style="color: #fff;"></i>';
}

btn.addEventListener("click", function () {
  document.body.classList.toggle("dark-theme");

  let theme = "light";
  if (document.body.classList.contains("dark-theme")) {
    theme = "dark";
    btn.innerHTML = '<i class="fas fa-sun fa-2x" style="color: #fff;"></i>';
  } else {
    btn.innerHTML = '<i class="fas fa-moon fa-2x" style="color: #000;"></i>';
  }
  localStorage.setItem("theme", theme);
});
