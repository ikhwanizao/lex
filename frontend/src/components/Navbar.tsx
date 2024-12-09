import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
    const { logout } = useAuth();

    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="text-xl font-bold text-gray-800">
                            Lex
                        </Link>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={logout}
                            className="ml-4 text-gray-600 hover:text-gray-800"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}