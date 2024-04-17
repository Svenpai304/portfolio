// function changeIframeSrc(src) {
//   document.getElementById('iframeContent').src = src;
//   document.querySelectorAll('.selectButton a').forEach(button => {
//     button.classList.remove('disabled');
//   });
//   document.getElementById(`${src.split('/')[1].split('.')[0]}Btn`).classList.add('disabled');
// }

// function adjustIframeHeight() {
//   var iframe = document.getElementById('iframeContent');
//   iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
// }

window.addEventListener('scroll', function () {
  var button = document.querySelector('.scrollButton');
  if (window.scrollY < 100) {
    button.style.opacity = '0';
  } else {
    button.style.opacity = '1';
  }
});

//move background
document.addEventListener('DOMContentLoaded', function() {
  const background = document.querySelector('.projBg');
  const tileWidth = background.offsetWidth;
  const tileHeight = background.offsetHeight;

  //offset
  let positionX = 0;
  let positionY = 0;
  //direction
  let directionX = -1;
  let directionY = 1;
  //speed
  let speed = 0.1;

  function moveBackground() {
    positionX += speed * directionX;
    positionY += speed * directionY;
    background.style.backgroundPosition = positionX + 'px ' + positionY + 'px';

    if (directionX === -1 && positionX <= -tileWidth) {
      positionX = 0;
    } else if (directionX === 1 && positionX >= tileWidth) {
      positionX = 0;
    }

    if (directionY === -1 && positionY <= -tileHeight) {
      positionY = 0;
    } else if (directionY === 1 && positionY >= tileHeight) {
      positionY = 0;
    }

    requestAnimationFrame(moveBackground);
  }

  moveBackground();
});


window.addEventListener('scroll', function() {
  var button = document.querySelector('.scrollButton');
  if (window.scrollY < 100) {
    button.style.opacity = '0';
  } else {
    button.style.opacity = '1';
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var button = document.querySelector('.scrollButton');
  button.style.opacity = '0';
});
