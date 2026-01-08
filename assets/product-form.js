if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');
        this.upsellButton = this.querySelector('#upsell-add-to-cart');

        if (this.upsellButton) {
          this.upsellButton.addEventListener('click', this.addUpsellToCart.bind(this));
        }

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      addUpsellToCart(evt) {
        evt.preventDefault();
        const variantId = this.upsellButton.dataset.variantId;
        if (!variantId) return;

        // Toggle upsell state
        const isSelected = this.upsellButton.classList.toggle('selected');
        this.upsellButton.textContent = isSelected ? 'Added' : 'Add';

        // Get the main product's inputs
        const mainVariantInput = this.form.querySelector('.product-variant-id');
        const mainQuantityInput = this.form.querySelector('.product-quantity');
        const mainSellingPlanInput = this.form.querySelector('input[name="selling_plan"]') || this.form.querySelector('input[name="items[0][selling_plan]"]');
        
        if (isSelected) {
          // Convert form to multi-item format
          mainVariantInput.name = 'items[0][id]';
          mainQuantityInput.name = 'items[0][quantity]';
          if (mainSellingPlanInput) {
            mainSellingPlanInput.name = 'items[0][selling_plan]';
          }

          // Add upsell item
          console.log(mainSellingPlanInput);
          let upsellVariantInput = this.form.querySelector('input[name="items[1][id]"]');
          if (!upsellVariantInput) {
            upsellVariantInput = document.createElement('input');
            upsellVariantInput.type = 'hidden';
            upsellVariantInput.name = 'items[1][id]';
            this.form.appendChild(upsellVariantInput);
          }
          upsellVariantInput.value = variantId;

          let upsellQuantityInput = this.form.querySelector('input[name="items[1][quantity]"]');
          if (!upsellQuantityInput) {
            upsellQuantityInput = document.createElement('input');
            upsellQuantityInput.type = 'hidden';
            upsellQuantityInput.name = 'items[1][quantity]';
            this.form.appendChild(upsellQuantityInput);
          }
          upsellQuantityInput.value = '1';

          let upsellProperty = this.form.querySelector('input[name="items[1][properties][_upsell]"]');
          if (!upsellProperty) {
            upsellProperty = document.createElement('input');
            upsellProperty.type = 'hidden';
            upsellProperty.name = 'items[1][properties][_upsell]';
            this.form.appendChild(upsellProperty);
          }
          upsellProperty.value = 'Discounted Add-on';
        } else {
          // Convert back to single item format
          mainVariantInput.name = 'id';
          mainQuantityInput.name = 'quantity';
          console.log(mainSellingPlanInput);
          if (mainSellingPlanInput) {
            mainSellingPlanInput.name = 'selling_plan';
          }

          // Remove upsell inputs
          const upsellInputs = this.form.querySelectorAll('input[name^="items[1]"]');
          upsellInputs.forEach(input => input.remove());
        }
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              }).then(() => {
                CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    CartPerformance.measure("add:paint-updated-sections", () => {
                      this.cart.renderContents(response);
                    });
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              CartPerformance.measure("add:paint-updated-sections", () => {
                this.cart.renderContents(response);
              });
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');

            CartPerformance.measureFromEvent("add:user-action", evt);
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}
