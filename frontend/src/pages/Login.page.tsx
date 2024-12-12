import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api.service';
import useAuth from '../hooks/useAuth.hook';
import { AxiosError } from 'axios';
import { ErrorResponse } from '../types/common.type';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { token } = await auth.login(email, password);
            login(token);
            navigate('/dashboard');
        } catch (err) {
            const errorResponse = (err as AxiosError<ErrorResponse>).response?.data;
            setError(errorResponse?.error || 'Invalid credentials');
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
                <div>
                    <h2 className="text-3xl font-extrabold text-center text-white">
                        Welcome to Lex
                    </h2>
                    <p className="mt-2 text-center text-gray-400">
                        New user?{' '}
                        <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Create an account
                        </Link>
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="bg-red-900/50 text-red-300 p-3 rounded-md text-center border border-red-700">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
}