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
  draw: (id: string, data?: any) => api.post(`/lotteries/${id}/draw`, data),
  cancel: (id: string) => api.post(`/lotteries/${id}/cancel`),
};

// Ticket API
export const ticketAPI = {
  purchase: (data: { lotteryId: string; numbers?: number[]; quantity?: number }) =>
    api.post('/tickets/purchase', data),

  getUserTickets: (params?: any) => api.get('/tickets', { params }),

  getAllLotteryTickets: (params?: any) => api.get('/tickets/lottery/all', { params }),

  // Nuevo: Obtiene TODOS los tickets de TODOS los sorteos (Admin)
  getAllTicketsAdmin: (params?: any) => api.get('/tickets/admin/all', { params }),

  // Nuevo: Anula un boleto con opción de reintegro
  cancel: (id: string, data: { refundType: 'full' | 'partial' | 'none'; refundPercentage?: number; reason?: string }) =>
    api.post(`/tickets/${id}/cancel`, data),

  verifyByCode: (code: string) => api.get(`/tickets/verify/${code}`),

  getByNumber: (number: string) => api.get(`/tickets/number/${number}`),

  verifyByLotteryAndNumber: (params: { lotteryId: string; number: string }) =>
    api.get('/tickets/verify-by-lottery', { params }),
};

// Payment API
export const paymentAPI = {
  deposit: (data: { amount: number; method: string; metadata?: any }) =>
    api.post('/payments/deposit', data),

  withdraw: (data: { amount: number; method: string; metadata?: any }) =>
    api.post('/payments/withdraw', data),

  getHistory: (params?: any) => api.get('/payments/history', { params }),

  getAll: (params?: any) => api.get('/payments/all', { params }),

  approve: (id: string) => api.post(`/payments/${id}/approve`),

  reject: (id: string, reason?: string) => api.post(`/payments/${id}/reject`, { reason }),
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
  updateEmail: (id: string, email: string) => api.put(`/users/${id}/email`, { email }),
  updatePassword: (id: string, currentPassword: string, newPassword: string) =>
    api.put(`/users/${id}/password`, { currentPassword, newPassword }),
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

// Email Template API
export const emailTemplateAPI = {
  getAll: () => api.get('/email-templates'),
  getByType: (type: string) => api.get(`/email-templates/${type}`),
  upsert: (type: string, data: any) => api.post(`/email-templates/${type}`, data),
  delete: (type: string) => api.delete(`/email-templates/${type}`),
  toggle: (type: string) => api.patch(`/email-templates/${type}/toggle`),
};

// Notifications API
export const notificationAPI = {
  getAll: (params?: { limit?: number; unreadOnly?: boolean }) =>
    api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};
