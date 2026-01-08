/**
 * Users Page (Admin Only)
 * Manage system users
 */

import { useState, useEffect } from 'react';
import { usersAPI, authAPI } from '../services/api';
import { ConfirmModal } from '../components/ConfirmModal';
import { Users, Plus, Trash2, X, Check, Shield, User, AlertCircle, Key } from 'lucide-react';

export function UsersPage() {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });
    const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

    useEffect(() => {
        refreshUsers();
    }, []);

    const refreshUsers = async () => {
        try {
            const data = await usersAPI.getAll();
            setUsers(data);
        } catch (err) {
            setError('Error al cargar usuarios');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await authAPI.register(formData.username, formData.password, formData.role);
            setSuccess('Usuario creado correctamente');
            resetForm();
            refreshUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.password !== passwordData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            await usersAPI.updatePassword(selectedUser.id, passwordData.password);
            setSuccess('Contraseña actualizada correctamente');
            setShowPasswordForm(false);
            setPasswordData({ password: '', confirmPassword: '' });
            setSelectedUser(null);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteClick = (e, user) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirm({ open: true, id: user.id, name: user.username });
    };

    const handleDeleteConfirm = async () => {
        try {
            await usersAPI.delete(deleteConfirm.id);
            setSuccess('Usuario eliminado');
            refreshUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        }
        setDeleteConfirm({ open: false, id: null, name: '' });
    };

    const handlePasswordClick = (user) => {
        setSelectedUser(user);
        setShowPasswordForm(true);
        setError('');
    };

    const resetForm = () => {
        setShowForm(false);
        setFormData({ username: '', password: '', role: 'user' });
        setError('');
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Usuarios</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">
                        Gestiona los usuarios del sistema
                    </p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Success message */}
            {success && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
                    <Check className="w-5 h-5" />
                    <span>{success}</span>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Usuario"
                message={`¿Estás seguro de eliminar a "${deleteConfirm.name}"?`}
            />

            {/* Create Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-[var(--color-surface-elevated)]">
                            <h2 className="text-xl font-bold">Nuevo Usuario</h2>
                            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">Nombre de Usuario</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="Mínimo 3 caracteres"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Contraseña</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Rol</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'user' })}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${formData.role === 'user'
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                                            : 'border-[var(--color-surface-elevated)]'
                                            }`}
                                    >
                                        <User className="w-5 h-5" />
                                        <span>Usuario</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'admin' })}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${formData.role === 'admin'
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                                            : 'border-[var(--color-surface-elevated)]'
                                            }`}
                                    >
                                        <Shield className="w-5 h-5" />
                                        <span>Admin</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={resetForm} className="btn btn-secondary flex-1">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary flex-1">
                                    <Check className="w-4 h-4" />
                                    Crear Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordForm && (
                <div className="modal-overlay" onClick={() => setShowPasswordForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-[var(--color-surface-elevated)]">
                            <h2 className="text-xl font-bold">Cambiar Contraseña: {selectedUser?.username}</h2>
                            <button onClick={() => setShowPasswordForm(false)} className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowPasswordForm(false)} className="btn btn-secondary flex-1">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary flex-1">
                                    <Check className="w-4 h-4" />
                                    Actualizar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Users List */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {users.map((user, index) => (
                    <div
                        key={user.id}
                        className="card animate-fadeIn"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                                }`}>
                                {user.role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handlePasswordClick(user)}
                                    className="p-2 rounded-lg hover:bg-[var(--color-primary)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                                    title="Cambiar contraseña"
                                >
                                    <Key className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(e, user)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                                    title="Eliminar usuario"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{user.username}</h3>
                        <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </span>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-[var(--color-text-muted)] opacity-50 mb-4" />
                    <p className="text-[var(--color-text-muted)]">No hay usuarios registrados</p>
                </div>
            )}
        </div>
    );
}

export default UsersPage;
