import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.hook';

export default function Navbar() {
    const { logout, user } = useAuth();

    useEffect(() => {
        // if (user) {
        //     console.log('Username:', user.username);
        // }
    }, [user]);

    return (
        <nav className="bg-gray-800 border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="text-xl font-bold text-white">
                            Lex
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user && (
                            <span className="text-gray-300">
                                {user.username}
                            </span>
                        )}
                        <button
                            onClick={logout}
                            className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-md hover:bg-gray-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}