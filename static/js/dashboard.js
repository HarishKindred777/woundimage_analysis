const body = document.body;
const menuLinks = document.querySelectorAll(".admin-menu a");
const collapseBtn = document.querySelectorAll(".admin-menu .collapse-btn");
const toggleMobileMenu = document.querySelector(".toggle-mob-menu");
const collapsedClass = "collapsed";


function collapse_btn() {
    this.getAttribute("aria-expanded") == "true"
      ? this.setAttribute("aria-expanded", "false")
      : this.setAttribute("aria-expanded", "true");
    this.getAttribute("aria-label") == "collapse menu"
      ? this.setAttribute("aria-label", "expand menu")
      : this.setAttribute("aria-label", "collapse menu");
    body.classList.toggle(collapsedClass);
    $("#home-btn").toggle()
}
collapseBtn[0].addEventListener("click", collapse_btn);


toggleMobileMenu.addEventListener("click", function() {
  this.getAttribute("aria-expanded") == "true"
    ? this.setAttribute("aria-expanded", "false")
    : this.setAttribute("aria-expanded", "true");
  this.getAttribute("aria-label") == "open menu"
    ? this.setAttribute("aria-label", "close menu")
    : this.setAttribute("aria-label", "open menu");
  body.classList.toggle("mob-menu-opened");
});


for (const link of menuLinks) {
  link.addEventListener("mouseenter", function() {
    body.classList.contains(collapsedClass) &&
    window.matchMedia("(min-width: 768px)").matches
      ? this.setAttribute("title", this.textContent)
      : this.removeAttribute("title");
  });
}

$(document).ready(function() {
    $("#wound-btn").on("click", function (event) {
        event.preventDefault();
        document.getElementById("wound-content").innerHTML='<object type="text/html" data="/kindred-form/" style="width:100%; height: 100%;"></object>';
        $("#wound-content").show()
        $("#report-content").hide()
        $("#validation-content").hide()
    });

    $("#validation-btn").on("click", function (event) {
        event.preventDefault();
        document.getElementById("validation-content").innerHTML='<object type="text/html" data="/validation/" style="width:100%; height: 100%;"></object>';
        $("#validation-content").show()
        $("#wound-content").hide()
        $("#report-content").hide()
    });

    $("#reports-btn").on("click", function (event) {
        event.preventDefault();
        $("#report-content").show()
        $("#wound-content").hide()
        $("#validation-content").hide()
    });

    $("#home-btn").on("click", function (event) {
        event.preventDefault();
        window.location.reload('/');
    });

});
