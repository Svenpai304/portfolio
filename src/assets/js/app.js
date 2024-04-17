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
  let directionX = 1;
  let directionY = -1;
  //speed
  let speed = .3;

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
