import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/api.service';
import { AxiosError } from 'axios';

export default function RequestPasswordReset() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setStatus('loading');
            setError('');
            await auth.requestPasswordReset(email);
            setStatus('success');
        } catch (err) {
            const error = err as AxiosError<{ error: string }>;
            setError(error.response?.data?.error || 'Failed to send reset email');
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
                    <p className="text-gray-300 mb-6">
                        If an account exists with the email you provided, you will receive password reset instructions shortly.
                    </p>
                    <Link
                        to="/login"
                        className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Reset Password</h2>
                <p className="text-gray-300 mb-6">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-900/50 text-red-300 p-3 rounded-md text-center border border-red-700">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={status === 'loading'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}