export interface User {
    id: number;
    email: string;
    username: string;
}

export interface AuthResponse {
    token: string;
}