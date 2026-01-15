// API service to connect frontend to backend
import axios from 'axios';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

// Add Interceptor for uploads (form-data)
export const uploadApi = {
    uploadFile: (fileOrFormData: File | FormData) => {
        let formData: FormData;
        if (fileOrFormData instanceof File) {
            formData = new FormData();
            formData.append('file', fileOrFormData);
        } else {
            formData = fileOrFormData;
        }
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }
};

api.interceptors.request.use((config) => {
    const rawToken = localStorage.getItem('token');
    const token = rawToken ? rawToken.trim().replace(/^"(.*)"$/, '$1') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (data: any) => api.post('/auth/login', data),
    signup: (data: any) => api.post('/auth/signup', data),
    getProfile: () => api.get('/auth/me'),
};

export const chatApi = {
    getConversations: () => api.get('/chats'),
    getMessages: (conversationId: string) => api.get(`/chats/${conversationId}/messages`),
    createGroup: (data: { name: string, participantIds: string[], avatar?: string }) => api.post('/chats/groups', data),
    addMember: (conversationId: string, userId: string) => api.post(`/chats/${conversationId}/members`, { userId }),
    removeMember: (conversationId: string, userId: string) => api.delete(`/chats/${conversationId}/members/${userId}`),
};

export const usersApi = {
    search: (query: string) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
    getMe: () => api.get('/users/me'),
    updateProfile: (data: any) => api.patch('/users/me', data),
    getById: (id: string) => api.get(`/users/${id}`),
    getByUsername: (username: string) => api.get(`/users/profile/${username}`),
};

export const friendsApi = {
    sendRequest: (userId: string) => api.post('/friends/requests', { userId }),
    getPendingRequests: () => api.get('/friends/requests'),
    respondToRequest: (id: string, accept: boolean) => api.patch(`/friends/requests/${id}`, { accept }),
    getFriends: () => api.get('/friends'),
};

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    getUsers: (page = 1, limit = 20) => api.get(`/admin/users?page=${page}&limit=${limit}`),
    updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
    updateUserStatus: (id: string, isActive: boolean) => api.patch(`/admin/users/${id}/status`, { isActive }),
    deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
    broadcastMessage: (content: string) => api.post('/admin/broadcast', { content }),

    // System Config
    getSystemConfig: () => api.get('/admin/config'),
    updateSystemConfig: (key: string, value: string) => api.patch('/admin/config', { key, value }),

    // Audit Logs
    getAuditLogs: (page = 1, limit = 50) => api.get(`/admin/audit-logs?page=${page}&limit=${limit}`),

    // Reports
    getReports: (page = 1, limit = 20) => api.get(`/admin/reports?page=${page}&limit=${limit}`),
    updateReportStatus: (id: string, status: string) => api.patch(`/admin/reports/${id}/status`, { status }),

    // Global Moderation
    getAllConversations: (page = 1, limit = 20) => api.get(`/admin/conversations?page=${page}&limit=${limit}`),
    getConversationMessages: (id: string, page = 1, limit = 50) => api.get(`/admin/conversations/${id}/messages?page=${page}&limit=${limit}`),
};

export const storiesApi = {
    getStories: () => api.get('/stories'),
    createStory: (formData: FormData) => api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    viewStory: (id: string) => api.post(`/stories/${id}/view`)
};

export const feedApi = {
    getFeed: () => api.get('/feed'),
    createPost: (formData: FormData) => api.post('/feed', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    toggleLike: (id: string) => api.post(`/feed/${id}/like`),
    addComment: (id: string, content: string) => api.post(`/feed/${id}/comments`, { content }),
    getComments: (id: string) => api.get(`/feed/${id}/comments`)
};
