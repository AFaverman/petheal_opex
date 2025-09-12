console.log('initializePdpForm');
function initializePdpForm(container) {
  const subscriptionRadio = container.querySelector('#subscription_option');
  const otpRadio = container.querySelector('#otp_option');
  const subscriptionDetails = container.querySelector('#subscription_details');
  const otpDetails = container.querySelector('#otp_details');
  const subscriptionParent = subscriptionDetails.closest('.pdp-subscriptions__container');
  const otpParent = otpDetails.closest('.pdp-otp__container');
  const form = container.querySelector('[data-type="add-to-cart-form"]') || container.querySelector('form');
  const formContainer = container.querySelector("product-form");
  const section = container.querySelector('#pdp-form');
  // Ensure basic elements exist before proceeding
  if (!subscriptionRadio || !otpRadio || !subscriptionDetails || !otpDetails || !form) {
    return;
  }

  const variantInput = form.querySelector('.product-variant-id');
  const subscriptionRadios = form.querySelectorAll('.subscription-radio');
  const otpRadios = form.querySelectorAll('.otp-radio');

  if (!variantInput) {
    return;
  }
  // Handle drawer functionality
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
  // Handle radio button changes
  function handleRadioChange() {
    if (subscriptionRadio.checked) {
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

  // Handle details summary clicks - prevent default toggle behavior
  const subscriptionSummary = subscriptionDetails.querySelector('.pdp-subscriptions-summary');
  const otpSummary = otpDetails.querySelector('.pdp-otp-summary');

  if (subscriptionSummary) {
    subscriptionSummary.addEventListener('click', function(e) {
      // If clicking the radio button itself, let it handle normally
      if (e.target.type === 'radio') {
        return;
      }
      e.preventDefault();
      subscriptionRadio.checked = true;
      handleRadioChange();
    });
  }

  if (otpSummary) {
    otpSummary.addEventListener('click', function(e) {
      // If clicking the radio button itself, let it handle normally  
      if (e.target.type === 'radio') {
        return;
      }
      e.preventDefault();
      otpRadio.checked = true;
      handleRadioChange();
    });
  }

  // Handle radio button changes directly
  subscriptionRadio.addEventListener('change', function() {
    if (this.checked) {
      handleRadioChange();
    }
  });
  
  otpRadio.addEventListener('change', function() {
    if (this.checked) {
      handleRadioChange();
    }
  });

  // Update form for subscription products
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

      // Add selling plan if available
      const sellingPlanId = selectedSubscription.dataset.sellingPlanId;
      // Check both possible selling plan input names
      let sellingPlanInput = form.querySelector('input[name="selling_plan"], input[name="items[0][selling_plan]"]');
      const isMultiItemForm = !!form.querySelector('input[name="items[1][id]"]');
      
      if (sellingPlanId && sellingPlanId !== 'undefined' && sellingPlanId !== '') {
        if (!sellingPlanInput) {
          sellingPlanInput = document.createElement('input');
          sellingPlanInput.type = 'hidden';
          form.appendChild(sellingPlanInput);
        }
        // Set the correct name based on whether we have multiple items
        sellingPlanInput.name = isMultiItemForm ? 'items[0][selling_plan]' : 'selling_plan';
        sellingPlanInput.value = sellingPlanId;
      } else if (sellingPlanInput) {
        sellingPlanInput.remove();
      }
    }
  }

  // Update form for OTP product
  function updateFormForOTP() {
    // Get the selected OTP variant radio button
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
    
    // Remove selling plan input for OTP (check both possible names)
    const sellingPlanInputs = form.querySelectorAll('input[name="selling_plan"], input[name="items[0][selling_plan]"]');
    sellingPlanInputs.forEach(input => input.remove());
  }

  // Handle subscription radio changes
  subscriptionRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (subscriptionRadio.checked) {
        updateFormForSubscription();
      }
    });
  });

  // Handle OTP radio changes
  otpRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (otpRadio.checked) {
        updateFormForOTP();
      }
    });
  });

  // Store original variant ID for OTP fallback
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