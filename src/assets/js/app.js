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

adjustIframeHeight();
document.getElementById('iframeContent').addEventListener('load', adjustIframeHeight);
changeIframeSrc('Proj/code.html');
