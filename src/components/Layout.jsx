/**
 * Main Layout Component
 * Responsive layout with sidebar (desktop) and bottom nav (mobile)
 */

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Scissors,
    UserCircle,
    LogOut,
    Sparkles,
    Menu,
    X,
    Shield,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/appointments', icon: Calendar, label: 'Citas' },
    { path: '/clients', icon: Users, label: 'Clientes' },
    { path: '/staff', icon: UserCircle, label: 'Personal' },
    { path: '/services', icon: Scissors, label: 'Servicios' },
];

export function Layout() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Add users link for admins
    const allNavItems = isAdmin
        ? [...navItems, { path: '/users', icon: Shield, label: 'Usuarios' }]
        : navItems;

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:w-64 bg-[var(--color-surface)] border-r border-[var(--color-surface-elevated)]">
                {/* Logo */}
                <div className="p-6 border-b border-[var(--color-surface-elevated)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg gradient-text">Ac-Cosmetic</h1>
                            <p className="text-xs text-[var(--color-text-muted)]">Sistema de Gestión</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                        {allNavItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                                            : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-elevated)]'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-[var(--color-surface-elevated)]">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-semibold">
                                {user?.username?.charAt(0).toUpperCase() || 'A'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user?.username || 'Admin'}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-lg border-b border-[var(--color-surface-elevated)]">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold gradient-text">Beauty Salon</span>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-[var(--color-text-muted)] hover:text-white"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-[var(--color-surface)] border-b border-[var(--color-surface-elevated)] p-4 animate-fadeIn">
                        <nav className="space-y-2">
                            {allNavItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white'
                                            : 'text-[var(--color-text-muted)]'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full mt-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 min-h-0 overflow-auto pb-20 md:pb-0">
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)]/95 backdrop-blur-lg border-t border-[var(--color-surface-elevated)] z-40">
                <ul className="flex justify-around py-2">
                    {navItems.slice(0, 5).map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${isActive
                                        ? 'text-[var(--color-primary)]'
                                        : 'text-[var(--color-text-muted)]'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

export default Layout;
