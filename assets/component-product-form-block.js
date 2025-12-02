console.log('initializePdpForm');
function initializePdpForm(container) {
  const otpRadio = container.querySelector('#otp_option');
  const otpDetails = container.querySelector('#otp_details');
  const form = container.querySelector('[data-type="add-to-cart-form"]') || container.querySelector('form');
  const formContainer = container.querySelector("product-form");
  const section = container.querySelector('#pdp-form');

  if (!form) return;

  const variantInput = form.querySelector('.product-variant-id');

  if (!variantInput || !otpRadio  || !otpDetails ) return;

  const subscriptionRadios = form.querySelectorAll('.subscription-radio');
  const otpRadios = form.querySelectorAll('.otp-radio');
  const otpParent = otpDetails.closest('.pdp-otp__container');

  let subscriptionParent, subscriptionDetails, subscriptionRadio;
  let hasSub = false;

  if(container.querySelector('.pdp-subscriptions__container')){
    hasSub = true;
    subscriptionParent = container.querySelector('.pdp-subscriptions__container');
    subscriptionDetails = container.querySelector('#subscription_details');
    subscriptionRadio = container.querySelector('#subscription_option');
  } 

  if (section.classList.contains('pdp-drawer')) {
    const drawerButton = container.querySelector('.pdp-drawer-button');
    if (drawerButton) {
      drawerButton.addEventListener('click', function() {
        section.classList.add('open');
      });
    }
    const drawerClose = section.querySelector('.pdp-drawer-close');
    if (drawerClose) {
      drawerClose.addEventListener('click', function() {
        section.classList.remove('open');
      });
    }
    section.addEventListener('click', function(e) {
      if (!e.target.closest("product-form") && section.classList.contains('open')) {
        section.classList.remove('open');
      }
    });
  }

  function handleRadioChange() {
    if (hasSub && subscriptionRadio.checked) {
      subscriptionDetails.open = true;
      otpDetails.open = false;
      if (!subscriptionParent.classList.contains(formContainer.dataset.colorScheme)) {
        subscriptionParent.classList.add(formContainer.dataset.colorScheme);
        subscriptionParent.classList.add('open');
      }
      if (otpParent.classList.contains(formContainer.dataset.colorScheme)) {
        otpParent.classList.remove(formContainer.dataset.colorScheme);
        otpParent.classList.remove('open');
      }
      updateFormForSubscription();
    } else if (otpRadio.checked) {
      if (!otpParent.classList.contains(formContainer.dataset.colorScheme)) {
        otpParent.classList.add(formContainer.dataset.colorScheme);
        otpParent.classList.add('open');
      }
      if (subscriptionParent.classList.contains(formContainer.dataset.colorScheme)) {
        subscriptionParent.classList.remove(formContainer.dataset.colorScheme);
        subscriptionParent.classList.remove('open');
      }
      subscriptionDetails.open = false;
      otpDetails.open = true;
      updateFormForOTP();
    }
  }
 
  const subscriptionSummary = subscriptionDetails ? subscriptionDetails.querySelector('.pdp-subscriptions-summary') : false;
  const otpSummary = otpDetails.querySelector('.pdp-otp-summary');

  if (subscriptionSummary) {
    subscriptionSummary.addEventListener('click', function(e) {
      if (e.target.type === 'radio') return;
      e.preventDefault();
      subscriptionRadio.checked = true;
      handleRadioChange();
    });
  }

  if (otpSummary) {
    otpSummary.addEventListener('click', function(e) {
      if (e.target.type === 'radio')  return;
      e.preventDefault();
      otpRadio.checked = true;
      handleRadioChange();
    });
  }
  if (subscriptionRadio) {
    subscriptionRadio.addEventListener('change', function() {
      if (this.checked) {
        handleRadioChange();
      }
    });
  }

  
  otpRadio.addEventListener('change', function() {
    if (this.checked) {
      handleRadioChange();
    }
  });

  function updateFormForSubscription() {
    const selectedSubscription = form.querySelector('.subscription-radio:checked');
    if (selectedSubscription) {
      variantInput.value = selectedSubscription.value;
      
      let sub_price = selectedSubscription.dataset.price,
        sub_compare_price = selectedSubscription.dataset.comparePrice;
      if (sub_price) {
        form.querySelector('.subscription-price').textContent = sub_price;
      }
      if (sub_compare_price) {
        form.querySelector('.subscription-price__compare').textContent = sub_compare_price;
      } else {
        form.querySelector('.subscription-price__compare').textContent = "";
      }


      const sellingPlanId = selectedSubscription.dataset.sellingPlanId;
      let sellingPlanInput = form.querySelector('input[name="selling_plan"], input[name="items[0][selling_plan]"]');
      const isMultiItemForm = !!form.querySelector('input[name="items[1][id]"]');
      
      if (sellingPlanId && sellingPlanId !== 'undefined' && sellingPlanId !== '') {
        if (!sellingPlanInput) {
          sellingPlanInput = document.createElement('input');
          sellingPlanInput.type = 'hidden';
          form.appendChild(sellingPlanInput);
        }
        sellingPlanInput.name = isMultiItemForm ? 'items[0][selling_plan]' : 'selling_plan';
        sellingPlanInput.value = sellingPlanId;
      } else if (sellingPlanInput) {
        sellingPlanInput.remove();
      }
    }
  }

  function updateFormForOTP() {
    const selectedOTP = form.querySelector('.otp-radio:checked');
    if (selectedOTP) {
      variantInput.value = selectedOTP.value;
      let otp_price = selectedOTP.dataset.price,
        otp_compare_price = selectedOTP.dataset.comparePrice;
      if (otp_price) {
        form.querySelector('.otp-price').textContent = otp_price;
      }
      if (otp_compare_price) {
        form.querySelector('.otp-price__compare').textContent = otp_compare_price;
      } else {
        form.querySelector('.otp-price__compare')= "";
      }
    }
    
    const sellingPlanInputs = form.querySelectorAll('input[name="selling_plan"], input[name="items[0][selling_plan]"]');
    sellingPlanInputs.forEach(input => input.remove());
  }

  subscriptionRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (subscriptionRadio.checked) {
        updateFormForSubscription();
      }
    });
  });

  otpRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (otpRadio.checked) {
        updateFormForOTP();
      }
    });
  });

  if (variantInput && !variantInput.dataset.originalId) {
    variantInput.dataset.originalId = variantInput.value;
  }

  handleRadioChange();
};

document.addEventListener('DOMContentLoaded', function() {
  initializePdpForm(document);
});

if (typeof Shopify !== 'undefined' && Shopify.designMode) {
  document.addEventListener('shopify:section:load', function(event) {
    initializePdpForm(event.target);
  });
};