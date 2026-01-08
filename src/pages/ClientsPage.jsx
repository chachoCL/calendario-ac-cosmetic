/**
 * Clients Page
 * CRUD for managing salon clients
 */

import { useState, useEffect } from 'react';
import { clientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { Users, Plus, Edit, Trash2, X, Check, Phone, Mail, StickyNote, Search, AlertCircle } from 'lucide-react';

export function ClientsPage() {
    const { user, isAdmin } = useAuth();
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        refreshClients();
    }, []);

    const refreshClients = async () => {
        try {
            const data = await clientsAPI.getAll();
            setClients(data);
        } catch (err) {
            setError('Error al cargar clientes');
        }
    };

    const filteredClients = clients.filter(
        (client) =>
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.phone.includes(searchQuery) ||
            client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingId) {
                await clientsAPI.update(editingId, formData);
            } else {
                await clientsAPI.create(formData);
            }
            resetForm();
            refreshClients();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (client) => {
        setEditingId(client.id);
        setFormData({
            name: client.name,
            phone: client.phone,
            email: client.email || '',
            notes: client.notes || '',
        });
        setShowForm(true);
    };

    const handleDeleteClick = (e, client) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirm({ open: true, id: client.id, name: client.name });
    };

    const handleDeleteConfirm = async () => {
        try {
            await clientsAPI.delete(deleteConfirm.id);
            refreshClients();
        } catch (err) {
            setError(err.message);
        }
        setDeleteConfirm({ open: false, id: null, name: '' });
    };

    const canModify = (client) => isAdmin || client.createdBy === user?.id;

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', phone: '', email: '', notes: '' });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Clientes</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">Gestiona tu base de clientes</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    Nuevo Cliente
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input type="text" className="input pl-12" placeholder="Buscar por nombre, teléfono o email..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Cliente"
                message={`¿Estás seguro de eliminar a "${deleteConfirm.name}"?`}
            />

            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-[var(--color-surface-elevated)]">
                            <h2 className="text-xl font-bold">{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">Nombre Completo *</label>
                                <input type="text" className="input" value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: María García" required />
                            </div>
                            <div>
                                <label className="label">Teléfono *</label>
                                <input type="tel" className="input" value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Ej: +56 9 1234 5678" required />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input type="email" className="input" value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Ej: cliente@email.com" />
                            </div>
                            <div>
                                <label className="label">Notas</label>
                                <textarea className="input min-h-[80px] resize-none" value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Preferencias, alergias, información importante..." />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={resetForm} className="btn btn-secondary flex-1">Cancelar</button>
                                <button type="submit" className="btn btn-primary flex-1">
                                    <Check className="w-4 h-4" />
                                    {editingId ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredClients.map((client, index) => (
                    <div key={client.id} className="card animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg font-bold">
                                {client.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            {canModify(client) && (
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(client)}
                                        className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-white transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={(e) => handleDeleteClick(e, client)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{client.name}</h3>
                        <div className="space-y-1 text-sm text-[var(--color-text-muted)]">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{client.phone}</span>
                            </div>
                            {client.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span className="truncate">{client.email}</span>
                                </div>
                            )}
                            {client.notes && (
                                <div className="flex items-start gap-2 mt-2 pt-2 border-t border-[var(--color-surface-elevated)]">
                                    <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span className="text-xs italic">{client.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredClients.length === 0 && searchQuery && (
                <div className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto text-[var(--color-text-muted)] opacity-50 mb-4" />
                    <p className="text-[var(--color-text-muted)]">No se encontraron clientes con "{searchQuery}"</p>
                </div>
            )}

            {clients.length === 0 && !searchQuery && (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-[var(--color-text-muted)] opacity-50 mb-4" />
                    <p className="text-[var(--color-text-muted)]">No hay clientes registrados</p>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4">
                        <Plus className="w-4 h-4" />
                        Agregar Primer Cliente
                    </button>
                </div>
            )}
        </div>
    );
}

export default ClientsPage;
