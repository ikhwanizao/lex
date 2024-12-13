import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.component';

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-900"> 
            <Navbar />
            <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
                <Outlet />
            </main>
        </div>
    );
}