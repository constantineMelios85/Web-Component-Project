const template = document.createElement('template');
template.innerHTML = `
  <style>
    .container {
      border: 3px solid yellow;
      position: relative;
      width: 300px;
      height: 300px;
      margin: 0 auto;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none; 
      -o-user-select: none;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas {
      position: absolute;
      top: 0;
    }
  </style>
  <div class="container" id="js-container">
    <canvas id="js-canvas" class="canvas" width="300" height="300" ></canvas>
    <slot class="secret"></slot>
  </div>
`;

class ScratchGame extends HTMLElement {
  static get observedAttributes() {
    return ['width', 'height', 'container-border', 'image', 'brush', 'radius', 'message'];
  }

  set width(value) {
    this._width = value;
  }

  get width() {
    return this._width;
  }

  set height(value) {
    this._height = value;
  }

  get height() {
    return this._height;
  }

  set radius(value) {
    this._radius = value;
  }

  get radius() {
    return this._radius;
  }

  set containerBorder(value) {
    this._containerBorder = value;
  }

  get containerBorder() {
    return this._containerBorder;
  }

  set image(value) {
    this._image = value;
  }

  get image() {
    return this._image;
  }

  set brush(value) {
    this._brush = value;
  }

  get brush() {
    return this._brush;
  }

  set message(value) {
    this._message = value;
  }

  get message() {
    return this._message;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  startCanvas() {
    var isDrawing, lastPoint;
    var container = this.shadowRoot.getElementById('js-container'),
      canvas = this.shadowRoot.getElementById('js-canvas'),
      message = this.message,
      canvasWidth = canvas.width,
      canvasHeight = canvas.height,
      ctx = canvas.getContext('2d'),
      image = new Image(),
      brush = new Image();

    image.src = this.image;
    image.onload = function () {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    brush.src = this.brush;

    canvas.addEventListener('mousedown', handleMouseDown, false);
    canvas.addEventListener('touchstart', handleMouseDown, false);
    canvas.addEventListener('mousemove', handleMouseMove, false);
    canvas.addEventListener('touchmove', handleMouseMove, false);
    canvas.addEventListener('mouseup', handleMouseUp, false);
    canvas.addEventListener('touchend', handleMouseUp, false);

    function distanceBetween(point1, point2) {
      return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    function angleBetween(point1, point2) {
      return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    }

    // Only test every `stride` pixel. `stride`x faster,
    // but might lead to inaccuracy
    function getFilledInPixels(stride) {
      if (!stride || stride < 1) {
        stride = 1;
      }

      var pixels = ctx.getImageData(0, 0, canvasWidth, canvasHeight),
        pdata = pixels.data,
        l = pdata.length,
        total = l / stride,
        count = 0;

      // Iterate over all pixels
      for (var i = (count = 0); i < l; i += stride) {
        if (parseInt(pdata[i]) === 0) {
          count++;
        }
      }

      return Math.round((count / total) * 100);
    }

    function getMouse(e, canvas) {
      var offsetX = 0,
        offsetY = 0,
        mx,
        my;

      if (canvas.offsetParent !== undefined) {
        do {
          offsetX += canvas.offsetLeft;
          offsetY += canvas.offsetTop;
        } while ((canvas = canvas.offsetParent));
      }

      mx = (e.pageX || e.touches[0].clientX) - offsetX;
      my = (e.pageY || e.touches[0].clientY) - offsetY;

      return { x: mx, y: my };
    }

    function handlePercentage(filledInPixels) {
      filledInPixels = filledInPixels || 0;
      if (filledInPixels > 50) {
        canvas.dispatchEvent(
          new CustomEvent('canvasFilled', {
            detail: { message },
            bubbles: true,
            composed: true,
          })
        );
        canvas.parentNode.removeChild(canvas);
      }
    }

    function handleMouseDown(e) {
      isDrawing = true;
      lastPoint = getMouse(e, canvas);
    }

    function handleMouseMove(e) {
      if (!isDrawing) {
        return;
      }

      e.preventDefault();

      var currentPoint = getMouse(e, canvas),
        dist = distanceBetween(lastPoint, currentPoint),
        angle = angleBetween(lastPoint, currentPoint),
        x,
        y;

      for (var i = 0; i < dist; i++) {
        x = lastPoint.x + Math.sin(angle) * i - 25;
        y = lastPoint.y + Math.cos(angle) * i - 25;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.drawImage(brush, x, y, 50, 50);
      }

      lastPoint = currentPoint;
      handlePercentage(getFilledInPixels(32));
    }

    function handleMouseUp(e) {
      isDrawing = false;
    }
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    const canvas = this.shadowRoot.getElementById('js-canvas');
    const container = this.shadowRoot.getElementById('js-container');

    if (attrName === 'width') {
      this.width = newValue;
      canvas.setAttribute('width', this.width);
      container.style.width = `${this.width}px`;
    }

    if (attrName === 'height') {
      this.height = newValue;
      canvas.setAttribute('height', this.height);
      container.style.height = `${this.height}px`;
    }

    if (attrName === 'container-border') {
      this.containerBorder = newValue;
      container.style.border = this.containerBorder;
    }

    if (attrName === 'image') {
      this.image = newValue;
    }

    if (attrName === 'brush') {
      this.brush = newValue;
    }

    if (attrName === 'radius') {
      this.radius = newValue;
      container.style.borderRadius = this.radius;
    }

    if (attrName === 'message') {
      this.message = newValue;
    }
  }

  connectedCallback() {
    const canvas = this.shadowRoot.getElementById('js-canvas');
    const container = this.shadowRoot.getElementById('js-container');
    const message = this.message;

    this.startCanvas();

    window.addEventListener('canvasFilled', function (event) {
      if (event.detail.message !== message) {
        canvas.style.visibility = 'hidden';
        container.style.visibility = 'hidden';
      }
    });
  }

  disconnectedCallback() {
    window.removeEventListener('canvasFilled');
  }
}

customElements.define('scratch-game', ScratchGame);
