/**
 * Login Page
 * Simple, touch-friendly login form
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, User, AlertCircle } from 'lucide-react';

export function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 500));

        const result = login(username, password);
        if (!result.success) {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo and Title */}
                <div className="text-center mb-8 animate-fadeIn">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 animate-pulse-glow">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">Ac-Cosmetic</h1>
                    <p className="text-[var(--color-text-muted)]">Sistema de Gestión</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-xl font-semibold mb-6 text-center">Iniciar Sesión</h2>

                    {/* Error message */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Username field */}
                    <div className="mb-4">
                        <label className="label" htmlFor="username">
                            Usuario
                        </label>
                        <input
                            id="username"
                            type="text"
                            className="input"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    {/* Password field */}
                    <div className="mb-6">
                        <label className="label" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Ingresando...
                            </span>
                        ) : (
                            'Ingresar'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
