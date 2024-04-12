function changeIframeSrc(src) {
    document.getElementById('iframeContent').src = src;
    document.querySelectorAll('.selectButton a').forEach(button => {
        button.classList.remove('disabled');
    });
    document.getElementById(`${src.split('/')[1].split('.')[0]}Btn`).classList.add('disabled');
}

function adjustIframeHeight() {
    var iframe = document.getElementById('iframeContent');
    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
}

function scrollToTop() {
    console.log("Scrolling to top...");
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

window.onscroll = function() {
    scrollFunction();
};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById('scrollToTop').style.display = 'block';
    } else {
        document.getElementById('scrollToTop').style.display = 'none';
    }
}

adjustIframeHeight();
document.getElementById('iframeContent').addEventListener('load', adjustIframeHeight);
changeIframeSrc('Proj/code.html');
