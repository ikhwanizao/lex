import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.component';

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-900"> 
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}