import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on a public page
      const publicPaths = ['/', '/login', '/register'];
      const currentPath = window.location.pathname;

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  }) => api.post('/auth/register', data),

  getProfile: () => api.get('/auth/profile'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),

  verifyResetToken: (token: string) =>
    api.get(`/auth/verify-reset-token/${token}`),
};

// Lottery API
export const lotteryAPI = {
  getAll: (params?: any) => api.get('/lotteries', { params }),
  getById: (id: string) => api.get(`/lotteries/${id}`),
  create: (data: any) => api.post('/lotteries', data),
  update: (id: string, data: any) => api.put(`/lotteries/${id}`, data),
  draw: (id: string) => api.post(`/lotteries/${id}/draw`),
  cancel: (id: string) => api.post(`/lotteries/${id}/cancel`),
};

// Ticket API
export const ticketAPI = {
  purchase: (data: { lotteryId: string; numbers?: number[]; quantity?: number }) =>
    api.post('/tickets/purchase', data),

  getUserTickets: (params?: any) => api.get('/tickets', { params }),

  verifyByCode: (code: string) => api.get(`/tickets/verify/${code}`),

  getByNumber: (number: string) => api.get(`/tickets/number/${number}`),
};

// Payment API
export const paymentAPI = {
  deposit: (data: { amount: number; method: string; metadata?: any }) =>
    api.post('/payments/deposit', data),

  withdraw: (data: { amount: number; method: string; metadata?: any }) =>
    api.post('/payments/withdraw', data),

  getHistory: (params?: any) => api.get('/payments/history', { params }),

  getAll: (params?: any) => api.get('/payments/all', { params }),
};

// Ranking API
export const rankingAPI = {
  getTopBuyers: (params?: any) =>
    api.get('/rankings/top-buyers', { params }),

  getTopWinners: (params?: any) =>
    api.get('/rankings/top-winners', { params }),

  getTopSpenders: (params?: any) =>
    api.get('/rankings/top-spenders', { params }),

  getStats: () => api.get('/rankings/stats'),

  getByLottery: (lotteryId: string) =>
    api.get(`/rankings/lottery/${lotteryId}`),

  getMonthly: (year: number, month: number) =>
    api.get('/rankings/monthly', { params: { year, month } }),

  getYearly: (year: number) =>
    api.get('/rankings/yearly', { params: { year } }),
};

// User API
export const userAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getBanned: (params?: any) => api.get('/users/banned/list', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  ban: (id: string, reason: string) => api.post(`/users/${id}/ban`, { reason }),
  unban: (id: string) => api.post(`/users/${id}/unban`),
  deactivate: (id: string) => api.post(`/users/${id}/deactivate`),
  activate: (id: string) => api.post(`/users/${id}/activate`),
  getStats: (id: string) => api.get(`/users/${id}/stats`),
  updateAvatar: (id: string, avatar: string) => api.put(`/users/${id}/avatar`, { avatar }),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
  updateLogo: (data: { logo?: string; logoCollapsed?: string }) =>
    api.put('/settings/logo', data),
  addPaymentMethod: (data: any) => api.post('/settings/payment-methods', data),
  updatePaymentMethod: (index: number, data: any) =>
    api.put(`/settings/payment-methods/${index}`, data),
  deletePaymentMethod: (index: number) =>
    api.delete(`/settings/payment-methods/${index}`),
};
