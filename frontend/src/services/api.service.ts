import axios from 'axios';
import { AuthResponse } from '../types/auth.type';
import { VocabularyWord, CreateWordData, UpdateWordData } from '../types/vocabulary.type';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    login: async (email: string, password: string) => {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        return response.data;
    },
    register: async (email: string, username: string, password: string) => {
        const response = await api.post<AuthResponse>('/auth/register', { email, password, username });
        return response.data;
    },
    requestPasswordReset: async (email: string) => {
        const response = await api.post<{ message: string }>('/auth/request-password-reset', { email });
        return response.data;
    },
    resetPassword: async (token: string, newPassword: string) => {
        const response = await api.post<{ message: string }>('/auth/reset-password', { 
            token, 
            newPassword 
        });
        return response.data;
    }
};

export const vocabulary = {
    getWords: async () => {
        const response = await api.get<VocabularyWord[]>('/vocabulary');
        return response.data;
    },
    addWord: async (data: CreateWordData) => {
        const response = await api.post<VocabularyWord>('/vocabulary', data);
        return response.data;
    },
    updateWord: async (id: number, data: UpdateWordData) => {
        const response = await api.put<VocabularyWord>(`/vocabulary/${id}`, data);
        return response.data;
    },
    deleteWord: async (id: number) => {
        const response = await api.delete(`/vocabulary/${id}`);
        return response.data;
    },
    generateDefinition: async (word: string) => {
        const response = await api.post<{ definition: string }>(
            '/vocabulary/generate-definition',
            { word }
        );
        return response.data;
    },
    generateAiExample: async (id: number, word: string, definition: string) => {
        const response = await api.post<{ aiExample: string }>(
            `/vocabulary/${id}/generate-example`,
            { word, definition }
        );
        return response.data;
    }
};

export default api;