fetch("components/sidebar.html")
.then(response => response.text())
.then(data => {

document.getElementById("sidebar-container").innerHTML = data;

const currentPage = window.location.pathname
.split("/")
.pop()
.replace(".html","");

const links = document.querySelectorAll("[data-page]");

links.forEach(link => {

if(link.dataset.page === currentPage){
link.classList.add("bg-gray-200","font-semibold");
}

});

});