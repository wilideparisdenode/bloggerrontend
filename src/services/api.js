import axios from "axios";

const BASE_URL = import.meta.env.VITE_END_POINT || 'http://localhost:5000/api';

class APIService {
    async request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const token = localStorage.getItem("token");
        
        const config = {
            ...options,
            headers: {
                ...options.headers,
                ...(token && { Authorization: `Bearer ${token}` })
            }
        };

        try {
            const response = await axios(url, config);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || error.message);
            } else if (error.request) {
                throw new Error('Network error - no response from server');
            } else {
                throw new Error(error.message);
            }
        }
    }

    // Auth methods
    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            data: credentials
        });
    }

    async register(credentials) {
        return this.request('/auth/register', {
            method: 'POST', 
            data: credentials
        });
    }

    // User methods
    async getAllUsers() {
        return this.request('/users', {
            method: 'GET'
        });
    }

    async getUserById(userId) {
        return this.request(`/users/${userId}`, {
            method: 'GET'
        });
    }

    async updateUser(userId, userData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            data: userData
        });
    }

    async changePassword(userId, passwordData) {
        return this.request(`/users/${userId}/password`, {
            method: 'PATCH',
            data: passwordData
        });
    }

    async deleteUser(userId) {
        return this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }

    // Article methods
    async getArticles(params = {}) {
        return this.request('/articles', {
            method: 'GET',
            params
        });
    }

    async getArticleById(articleId) {
        return this.request(`/articles/${articleId}`, {
            method: 'GET'
        });
    }

    async createArticle(articleData) {
        const formData = new FormData();  
        
        // Append all fields
        formData.append('title', articleData.title);
        formData.append('content', articleData.content);
        formData.append('category', articleData.category);
        formData.append('tags', articleData.tags);
        formData.append('excerpt', articleData.excerpt);
        
        // Append the file
        if (articleData.file) {
            formData.append('file', articleData.file);
        }

        return this.request('/articles', {
            method: 'POST',
            data: formData,
        });
    }

    async updateArticle(articleId, articleData) {
        return this.request(`/articles/${articleId}`, {
            method: 'PUT',
            data: articleData
        });
    }

    async deleteArticle(articleId) {
        return this.request(`/articles/${articleId}`, {
            method: 'DELETE'
        });
    }
    async like(articleId) {
        return this.request(`/articles/${articleId}/like`, {
            method: 'PATCH',
          
        });
    }
     async comment(articleId,comment) {
        return this.request(`/articles/${articleId}/comment`, {
            method: 'PATCH',
             data:{comment}
        });
    }
}

export const API = new APIService();