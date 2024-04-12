function changeIframeSrc(e) {
    document.getElementById("iframeContent").src = e, document.querySelectorAll(".selectButton a").forEach((e => {
        e.classList.remove("disabled")
    })), document.getElementById(`${e.split("/")[1].split(".")[0]}Btn`).classList.add("disabled")
}

function adjustIframeHeight() {
    var e = document.getElementById("iframeContent");
    e.style.height = e.contentWindow.document.body.scrollHeight + "px"
}

function scrollToTop() {
    console.log("Scrolling to top..."), document.body.scrollTop = 0, document.documentElement.scrollTop = 0
}

function scrollFunction() {
    document.body.scrollTop > 20 || document.documentElement.scrollTop > 20 ? document.getElementById("scrollToTop").style.display = "block" : document.getElementById("scrollToTop").style.display = "none"
}

window.onscroll = function () {
    scrollFunction()
}, adjustIframeHeight(), document.getElementById("iframeContent").addEventListener("load", adjustIframeHeight), changeIframeSrc("Proj/code.html");//# sourceMappingURL=app.js.map
