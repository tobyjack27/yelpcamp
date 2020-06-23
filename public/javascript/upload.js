var form = document.querySelector("form")
var submit = document.querySelector("button.submit")

form.addEventListener("submit", function(){
    submit.classList.add("hidden");
}); 