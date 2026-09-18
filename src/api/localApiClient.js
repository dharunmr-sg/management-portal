const BASE_URL = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000/api';

class LocalApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      // Parse JSON
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || `API Error: ${response.status}`);
      }

      if (json.success === false) {
        throw new Error(json.message || 'API request failed');
      }

      // Return the data portion directly to the frontend based on the standard backend response
      return json.data;
    } catch (error) {
      console.error(`Local API Request Failed [${options.method || 'GET'} ${endpoint}]:`, error);
      throw error; // Re-throw to be handled by the caller
    }
  }

  async get(endpoint) {
    return this.request(endpoint, {
      method: "GET",
    });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

const localApiClient = new LocalApiClient(BASE_URL);

export default localApiClient;
