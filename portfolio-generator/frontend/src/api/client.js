const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('portfolio_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('portfolio_token', token);
    } else {
      localStorage.removeItem('portfolio_token');
    }
  }

  getHeaders(isFormData = false) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(isFormData),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        let errData = {};
        try {
          errData = await response.json();
        } catch {
          errData = { detail: response.statusText };
        }
        throw new Error(errData.detail || errData.error || Object.values(errData)[0] || `Request failed (${response.status})`);
      }
      if (response.status === 204) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.warn(`API request error on ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Auth endpoints
  async register(data) {
    const res = await this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async login(username, password) {
    const res = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  logout() {
    this.setToken(null);
  }

  async getMe() {
    return this.request('/auth/me/');
  }

  // AI endpoints
  async parseResume(resumeText, file = null) {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      return this.request('/ai/parse-resume/', {
        method: 'POST',
        body: formData,
      });
    }
    return this.request('/ai/parse-resume/', {
      method: 'POST',
      body: JSON.stringify({ resume_text: resumeText }),
    });
  }

  async enhanceDescription(rawText, targetRole) {
    return this.request('/ai/enhance/', {
      method: 'POST',
      body: JSON.stringify({ raw_text: rawText, target_role: targetRole }),
    });
  }

  // Portfolio CRUD
  async listPortfolios() {
    return this.request('/portfolios/');
  }

  async getPortfolio(slug) {
    return this.request(`/portfolios/${slug}/`);
  }

  async createPortfolio(data) {
    return this.request('/portfolios/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePortfolio(slug, data) {
    return this.request(`/portfolios/${slug}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePortfolio(slug) {
    return this.request(`/portfolios/${slug}/`, {
      method: 'DELETE',
    });
  }

  // Public portfolio
  async getPublicPortfolio(slug) {
    return this.request(`/public/portfolio/${slug}/`);
  }
}

export const api = new ApiClient();
export default api;

