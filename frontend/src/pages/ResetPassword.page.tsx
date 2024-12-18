import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { auth } from '../services/api.service';
import { AxiosError } from 'axios';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            navigate('/request-password-reset');
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            setStatus('loading');
            setError('');
            await auth.resetPassword(token!, password);
            setStatus('success');
        } catch (err) {
            const error = err as AxiosError<{ error: string }>;
            setError(error.response?.data?.error || 'Failed to reset password');
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-4">Password Reset Successful</h2>
                    <p className="text-gray-300 mb-6">
                        Your password has been reset successfully. You can now log in with your new password.
                    </p>
                    <Link
                        to="/login"
                        className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Set New Password</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-900/50 text-red-300 p-3 rounded-md text-center border border-red-700">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            required
                            disabled={status === 'loading'}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            required
                            disabled={status === 'loading'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}