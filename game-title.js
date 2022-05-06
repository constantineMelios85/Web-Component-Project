const template = document.createElement('template');

template.innerHTML = `
  <style>
    .title {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 52px;
      text-align: center;
      color: lightblue;
    }
    .subtitle {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 32px;
      height: 46px;
      text-align: center;
      color: blue;
    }
  </style>
  <h1 class="title" id="title"></h1>
  <p class="subtitle" id="subtitle"></p>
`;

class GameTitle extends HTMLElement {
  static get observedAttributes() {
    return ['content'];
  }

  set content(value) {
    this._content = value;
  }

  get content() {
    return this._content;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    const title = this.shadowRoot.getElementById('title');
    const subTitle = this.shadowRoot.getElementById('subTitle');

    if (attrName === 'content') {
      this.content = newValue;
      title.textContent = this.content;
    }
  }

  connectedCallback() {
    const subTitle = this.shadowRoot.getElementById('subtitle');

    window.addEventListener('canvasFilled', function (event) {
      subTitle.textContent = event.detail.message;
    });
  }

  disconnectedCallback() {
    window.removeEventListener('canvasFilled');
  }
}

customElements.define('game-title', GameTitle);
