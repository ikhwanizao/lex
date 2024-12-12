import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types/auth.type';

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const useAuth = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('token') 
        ? jwtDecode<User>(localStorage.getItem('token')!) 
        : null,
    isAuthenticated: !!localStorage.getItem('token'),
    login: (token) => {
        localStorage.setItem('token', token);
        const user = jwtDecode<User>(token);
        set({ token, user, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false });
    }
}));

export default useAuth;