const template = document.createElement('template');

template.innerHTML = `
  <style>
    .flex {
      display: flex;
    }
  </style>
  <div class="flex" id="box">
    <slot></slot>
  </div>
`;

class FlexBox extends HTMLElement {
  static get observedAttributes() {
    return ['align-items', 'justify-content', 'wrap', 'direction', 'gap'];
  }

  set alignItems(value) {
    this._alignItems = value;
  }

  get alignItems() {
    return this._alignItems;
  }

  set justifyContent(value) {
    this._justifyContent = value;
  }

  get justifyContent() {
    return this._justifyContent;
  }

  set wrap(value) {
    this._wrap = value;
  }

  get wrap() {
    return this._wrap;
  }

  set direction(value) {
    this._direction = value;
  }

  get direction() {
    return this._direction;
  }

  set gap(value) {
    this._gap = value;
  }

  get gap() {
    return this._gap;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    const box = this.shadowRoot.getElementById('box');

    if (attrName === 'align-items') {
      this.alignItems = newValue;
      box.style.alignItems = this.alignItems;
    }

    if (attrName === 'justify-content') {
      this.justifyContent = newValue;
      box.style.justifyContent = this.justifyContent;
    }

    if (attrName === 'wrap') {
      this.wrap = newValue;
      box.style.flexWrap = this.wrap;
    }

    if (attrName === 'direction') {
      this.direction = newValue;
      box.style.flexDirection = this.direction;
    }

    if (attrName === 'gap') {
      this.gap = newValue;
      box.style.gap = this.gap;
    }
  }
}

customElements.define('flex-box', FlexBox);
