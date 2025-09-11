class ShopifyCustomerAPI {
    constructor() {
      this.apiURL = `/apps/metaobjects`;
    }
  
    // Update customer (flexible - can update firstName, lastName, email, or any combination)
    async updateCustomer(customerId, { firstName, lastName, email } = {}) {
      // Build customerData object with only the provided fields
      const customerData = {};
      if (firstName !== undefined) customerData.firstName = firstName;
      if (lastName !== undefined) customerData.lastName = lastName;
      if (email !== undefined) customerData.email = email;
  
      // Throw error if no fields provided
      if (Object.keys(customerData).length === 0) {
        throw new Error('At least one field (firstName, lastName, or email) must be provided');
      }
  
      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'customer',
          action: 'update',
          customerId: customerId,
          customerData: customerData
        })
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update customer: ${response.status}`);
      }
  
      return await response.json();
    }
  
    // Add new address to customer
    async addAddress(customerId, addressData) {
      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'customer',
          action: 'addAddress',
          customerId: customerId,
          addressData: addressData
        })
      });
  
      if (!response.ok) {
        throw new Error(`Failed to add address: ${response.status}`);
      }
  
      return await response.json();
    }
  
    // Update existing address
    async updateAddress(customerId, addressId, addressData) {
      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'customer',
          action: 'updateAddress',
          customerId: customerId,
          addressId: addressId,
          addressData: addressData
        })
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update address: ${response.status}`);
      }
  
      return await response.json();
    }
  
    // Delete address
    async deleteAddress(customerId, addressId) {
      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'customer',
          action: 'deleteAddress',
          customerId: customerId,
          addressId: addressId
        })
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete address: ${response.status}`);
      }
  
      return await response.json();
    }
  
    // Set default address
    async setDefaultAddress(customerId, addressId) {
      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'customer',
          action: 'setDefaultAddress',
          customerId: customerId,
          addressId: addressId
        })
      });
  
      if (!response.ok) {
        throw new Error(`Failed to set default address: ${response.status}`);
      }
  
      return await response.json();
    }
  }