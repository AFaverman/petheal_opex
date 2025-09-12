class CartNotification extends HTMLElement {
  constructor() {
    super();

    this.notification = document.getElementById('cart-notification');
    this.header = document.querySelector('sticky-header');
    this.onBodyClick = this.handleBodyClick.bind(this);

    this.notification.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
      closeButton.addEventListener('click', this.close.bind(this))
    );
  }

  open() {
    this.notification.classList.add('animate', 'active');

    this.notification.addEventListener(
      'transitionend',
      () => {
        this.notification.focus();
        trapFocus(this.notification);
      },
      { once: true }
    );

    document.body.addEventListener('click', this.onBodyClick);
  }

  close() {
    this.notification.classList.remove('active');
    document.body.removeEventListener('click', this.onBodyClick);

    removeTrapFocus(this.activeElement);
  }

  renderContents(parsedState) {
    // Handle both single and multiple items
    this.cartItems = Array.isArray(parsedState.items) ? parsedState.items : [{ key: parsedState.key }];
    
    this.getSectionsToRender().forEach((section) => {
      const element = document.getElementById(section.id);
      if (!element) return;

      // For product notifications, we'll render all items in a container
      if (section.id === 'cart-notification-product') {
        const productHTML = this.cartItems.map(item => {
          const sectionHTML = parsedState.sections[section.id];
          const tempDiv = document.createElement('div');
          tempDiv.classList.add('cart-notification-product');
          tempDiv.innerHTML = this.getSectionInnerHTML(sectionHTML, `[id="cart-notification-product-${item.key}"]`);
          return tempDiv.outerHTML;
        }).join('');
        
        element.innerHTML = productHTML;
      } else {
        element.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
      }
    });

    if (this.header) this.header.reveal();
    this.open();
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-notification-product'
      },
      {
        id: 'cart-notification-button'
      },
      {
        id: 'cart-icon-bubble'
      },
    ];
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target !== this.notification && !target.closest('cart-notification')) {
      const disclosure = target.closest('details-disclosure, header-menu');
      this.activeElement = disclosure ? disclosure.querySelector('summary') : null;
      this.close();
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-notification', CartNotification);
