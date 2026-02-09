const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Token management
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => authToken;

// Headers helper
const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (includeAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      try {
        console.log('Login request to:', `${API_BASE_URL}/api/auth/login`);
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Login failed');
        }
        const data = await response.json();
        setAuthToken(data.token);
        return data;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    register: async (email: string, password: string, name: string, role: string = 'user') => {
      try {
        console.log('Register request to:', `${API_BASE_URL}/api/auth/register`);
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Registration failed');
        }
        const data = await response.json();
        if (data.token) {
          setAuthToken(data.token);
        }
        return data;
      } catch (error) {
        console.error('Register error:', error);
        throw error;
      }
    },

    getProfile: async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to get profile');
      return response.json();
    },

    logout: () => {
      setAuthToken(null);
    },

    // Admin approval endpoints
    getPendingApprovals: async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/pending-approvals`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch pending approvals');
      return response.json();
    },

    getApprovedAdmins: async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/approved-admins`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch approved admins');
      return response.json();
    },

    approveAdmin: async (adminId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/${adminId}/approve`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to approve admin');
      return response.json();
    },

    rejectAdmin: async (adminId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/${adminId}/reject`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to reject admin');
      return response.json();
    },

    removeAdmin: async (adminId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/${adminId}/remove`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to remove admin');
      return response.json();
    },
  },

  notices: {
    // Get all notices (admin - requires auth)
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/notices`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch notices');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },

    // Get published notices only (public - no auth required)
    getPublished: async () => {
      const response = await fetch(`${API_BASE_URL}/api/notices/published`);
      if (!response.ok) throw new Error('Failed to fetch published notices');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    
    // Upload file and create notice
    upload: async (formData: FormData) => {
      const headers: HeadersInit = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const response = await fetch(`${API_BASE_URL}/api/notices/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload notice');
      return response.json();
    },
    
    update: async (id: string, updates: Record<string, unknown>) => {
      const response = await fetch(`${API_BASE_URL}/api/notices/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update notice');
      return response.json();
    },

    // Toggle publish status
    togglePublish: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/notices/${id}/toggle`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to toggle notice status');
      return response.json();
    },
    
    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/notices/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete notice');
      return response.json();
    },
  },
};
