function switchPdpTab(component, tabIndex) {
  const tabButtons = component.querySelectorAll('.tabulated-content__tab');
  const panels = component.querySelectorAll('.tabulated-content__panel');

  tabButtons.forEach(btn => {
    if (btn.dataset.tabIndex === tabIndex) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  panels.forEach(panel => {
    if (panel.dataset.panelIndex === tabIndex) {
      panel.style.display = '';
    } else {
      panel.style.display = 'none';
    }
  });
}

function initializePdpTabs(container) {
  const pdpTabulatedContent = container.querySelectorAll('.pdp-tabulated-content, .page-tabulated-content');
  pdpTabulatedContent.forEach(content => {
    const tabButtons = content.querySelectorAll('.tabulated-content__tab');
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        switchPdpTab(content, button.dataset.tabIndex);
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initializePdpTabs(document);
});

document.addEventListener('shopify:section:load', function(event) {
  initializePdpTabs(event.target);
});

if (typeof Shopify !== 'undefined' && Shopify.designMode) {
  document.addEventListener('shopify:block:select', (event) => {
    const panel = event.target.closest('.tabulated-content__panel');
    if (!panel) return;

    const component = panel.closest('.pdp-tabulated-content, .page-tabulated-content');
    if (!component) return;

    const panelIndex = panel.dataset.panelIndex;
    if (typeof panelIndex !== 'undefined') {
      switchPdpTab(component, panelIndex);
    }
  });
}