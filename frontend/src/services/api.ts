import axios from 'axios';
import { AuthResponse } from '../types/auth';
import { VocabularyWord, CreateWordData, UpdateWordData } from '../types/vocabulary';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
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
    register: async (email: string, password: string) => {
        const response = await api.post<AuthResponse>('/auth/register', { email, password });
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
    }
};

export default api;