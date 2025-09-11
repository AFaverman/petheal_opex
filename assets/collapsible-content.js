document.addEventListener('DOMContentLoaded', function() {
  initializeCollapsibleContent();
});

if (typeof Shopify !== 'undefined' && Shopify.designMode) {
  document.addEventListener('shopify:section:load', function(event) {
    setTimeout(() => {
      initializeCollapsibleContent(event.target);
    }, 50);
  });
  
  document.addEventListener('shopify:section:unload', function(event) {
    cleanupCollapsibleContent(event.target);
  });
}

function initializeCollapsibleContent(container = document) {
  const accordionDetails = container.querySelectorAll('.collapsible-content__details:not([data-accordion-initialized])');
  
  const containerGroups = new Map();
  
  accordionDetails.forEach(detail => {
    const parentContainer = detail.closest('.product__column') || detail.closest('.collapsible-content, .tabulated-content__panel');
    
    if (parentContainer) {
      if (!containerGroups.has(parentContainer)) {
        containerGroups.set(parentContainer, []);
      }
      containerGroups.get(parentContainer).push(detail);
    }
  });
  
  containerGroups.forEach((details, parentContainer) => {
    setupAccordionGroup(parentContainer, details);
  });
}

function setupAccordionGroup(parentContainer, details) {
  const singleOpenOnly = parentContainer.dataset.singleOpenOnly === 'true' ||  parentContainer.querySelector('[data-single-open="true"]') !== null;
  
  details.forEach(detail => {
    detail.setAttribute('data-accordion-initialized', 'true');
    
    detail.addEventListener('click', function(e) {
      e.preventDefault();
      let el = e.target.closest('details');
      let content = el.querySelector('.accordion__content');
      
      if (!el.hasAttribute('open')) {
        el.setAttribute('open', 'true');
        requestAnimationFrame(() => {
          content.classList.add('animate');
          const fullHeight = content.scrollHeight + 'px';
          content.style.setProperty('--accordion-content-height', fullHeight);
        });
        
        if (singleOpenOnly) {
          details.forEach(otherDetail => {
            if (otherDetail !== el && otherDetail.hasAttribute('open')) {
              closeAccordionItem(otherDetail);
            }
          });
        }
      } else {
        closeAccordionItem(el);
      }
    });
  });
}

function closeAccordionItem(detail) {
  detail.classList.add('closing');
  let content = detail.querySelector('.accordion__content');
  content.style.setProperty('--accordion-content-height', '0');
  content.classList.remove('animate');
  
  const handleTransitionEnd = function() {
    detail.classList.remove('closing');
    detail.removeAttribute('open');
    content.removeEventListener('transitionend', handleTransitionEnd);
  };
  
  content.addEventListener('transitionend', handleTransitionEnd, { once: true });
}

function cleanupCollapsibleContent(container = document) {
  const accordionDetails = container.querySelectorAll('.collapsible-content__details[data-accordion-initialized]');
  
  accordionDetails.forEach(detail => {
    const newDetail = detail.cloneNode(true);
    detail.parentNode.replaceChild(newDetail, detail);
  });
}
