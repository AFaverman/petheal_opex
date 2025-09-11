class ShopifyMetaobjectAPI {
    constructor() {
      this.apiURL = `/apps/metaobjects`;
    }
    async uploadImage(file) {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch(this.apiURL, {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
  
      const result = await response.json();
      
      if (result.status === 'PROCESSING') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      return result;
    }
    //create metaobject
    async createMetaobject(type, handle, fields) {
      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          type: type,
          handle: handle,
          fields: fields
        })
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create metaobject: ${response.status}`);
      }
  
      return await response.json();
    }
    //update metaobject
    async updateMetaobject(metaobjectId, fields) {
      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          action: 'update',
          id: metaobjectId,
          fields: fields
        })
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update metaobject: ${response.status}`);
      }
  
      return await response.json();
    }
    // Query metaobjects by field value
    async queryMetaobjects(type, fieldKey, fieldValue) {
      const response = await fetch(this.apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'query',
          type: type,
          fieldKey: fieldKey,
          fieldValue: fieldValue
        })
      });
      if (!response.ok) {
        throw new Error(`Failed to query metaobjects: ${response.status}`);
      }
      return await response.json();
    }

    async getMetaobjectByHandle(handle) {
      const obfs = "f69a43e14965fa519b6a650b4d30e6fe";
      const shop = "petheal.myshopify.com";
      const query = `
        query GetMetaobjectByHandle($handle: MetaobjectHandleInput!) {
          metaobject(handle: $handle) {
            fields {
              key
              value
              reference {
                ... on MediaImage {
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      `;

      const variables = {
        handle: {
          type: "pet",      // your metaobject type
          handle: handle    // the specific handle, e.g. "fluffy-123"
        }
      };

      const response = await fetch(`https://${shop}/api/2025-01/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": obfs,
        },
        body: JSON.stringify({ query, variables }),
      });

      const { data, errors } = await response.json();
      const fields = {};
      data.metaobject.fields.forEach(field => {
        if (field.reference?.image) {
          fields[field.key] = field.reference.image.url; // use image URL
        } else {
          fields[field.key] = field.value; // fallback to text value
        }
      });

      if (errors) {
        console.error("GraphQL errors:", errors);
        throw new Error("Failed to fetch metaobject");
      }

      return fields;
    }
    
    //delete metaobject
    async deleteMetaobject(metaobjectId) {
      try {
        const response = await fetch(this.apiURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete',
            id: metaobjectId
          })
        });
    
        const result = await response.json();
        
        if (result.success) {
          console.log('Metaobject deleted successfully:', result.deletedId);
          return result;
        } else {
          console.error('Delete failed:', result.error, result.details);
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error deleting metaobject:', error);
        throw error;
      }
    }
  }