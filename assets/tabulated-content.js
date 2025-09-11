class TabulatedContent extends HTMLElement {
  constructor() {
    super();
    this.tabs = this.querySelectorAll('.tabulated-content__tab');
    this.panels = this.querySelectorAll('.tabulated-content__panel');
    this.currentActiveIndex = 0;
    
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      const targetTab = Array.from(this.tabs).find(tab => tab.dataset.tabHandle === tabParam);
      if (targetTab) {
        this.switchTab(parseInt(targetTab.dataset.tabIndex));
      }
    } else if (window.location.hash.indexOf("#ContactForm") > -1) {
      const targetTab = Array.from(this.tabs).find(tab => tab.dataset.tabHandle === "contact-us");
      if (targetTab) {
        this.switchTab(parseInt(targetTab.dataset.tabIndex));
      }
    }
    
    this.init();
  }

  init() {
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => this.switchTab(index));
    });
    
    const mobileHeaders = this.querySelectorAll('.tabulated-content__mobile-header');
    mobileHeaders.forEach((header) => {
      header.addEventListener('click', () => {
        const tabIndex = parseInt(header.getAttribute('data-tab-index'));
        this.switchTab(tabIndex);
      });
    });
    
    this.setActivePanel(this.currentActiveIndex);
  }
  
  switchTab(index) {
    if (index === this.currentActiveIndex) return;
    
    this.tabs[this.currentActiveIndex].setAttribute('aria-selected', 'false');
    this.tabs[index].setAttribute('aria-selected', 'true');
    
    this.setActivePanel(index);
    this.currentActiveIndex = index;
  }
  
  setActivePanel(index) {
    this.panels.forEach((panel, i) => {
      if (i === index) {
        panel.setAttribute('data-active', 'true');
      } else {
        panel.setAttribute('data-active', 'false');
      }
    });
  }
}

if (!customElements.get('tabulated-content')) {
  customElements.define('tabulated-content', TabulatedContent);
}

if (typeof Shopify !== 'undefined' && Shopify.designMode) {
  document.addEventListener('shopify:block:select', (event) => {
    const panel = event.target.closest('.tabulated-content__panel');
    if (!panel) return;
    
    const component = panel.closest('tabulated-content');
    if (!component) return;
    
    const panels = Array.from(component.querySelectorAll('.tabulated-content__panel'));
    const panelIndex = panels.indexOf(panel);
    
    if (panelIndex !== -1) {
      component.switchTab(panelIndex);
    }
  });
} 