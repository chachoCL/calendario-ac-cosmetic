/**
 * Services Page
 * CRUD for managing salon services
 */

import { useState, useEffect } from 'react';
import { servicesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { Scissors, Plus, Edit, Trash2, Clock, DollarSign, X, Check, AlertCircle } from 'lucide-react';

export function ServicesPage() {
    const { user, isAdmin } = useAuth();
    const [services, setServices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', duration: '', price: '' });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        refreshServices();
    }, []);

    const refreshServices = async () => {
        try {
            const data = await servicesAPI.getAll();
            setServices(data);
        } catch (err) {
            setError('Error al cargar servicios');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const data = {
            name: formData.name,
            duration: parseInt(formData.duration),
            price: parseInt(formData.price),
        };

        try {
            if (editingId) {
                await servicesAPI.update(editingId, data);
            } else {
                await servicesAPI.create(data);
            }
            resetForm();
            refreshServices();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (service) => {
        setEditingId(service.id);
        setFormData({
            name: service.name,
            duration: service.duration.toString(),
            price: service.price.toString(),
        });
        setShowForm(true);
    };

    const handleDeleteClick = (e, service) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirm({ open: true, id: service.id, name: service.name });
    };

    const handleDeleteConfirm = async () => {
        try {
            await servicesAPI.delete(deleteConfirm.id);
            refreshServices();
        } catch (err) {
            setError(err.message);
        }
        setDeleteConfirm({ open: false, id: null, name: '' });
    };

    const canModify = (service) => {
        return isAdmin || service.createdBy === user?.id;
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', duration: '', price: '' });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Servicios</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">
                        Administra los servicios del salón
                    </p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    Nuevo Servicio
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Servicio"
                message={`¿Estás seguro de eliminar "${deleteConfirm.name}"? Esta acción no se puede deshacer.`}
            />

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-[var(--color-surface-elevated)]">
                            <h2 className="text-xl font-bold">
                                {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
                            </h2>
                            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">Nombre del Servicio</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Manicure con Gel"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Duración (minutos)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="Ej: 60"
                                    min="5"
                                    max="480"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Precio ($)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="Ej: 25000"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={resetForm} className="btn btn-secondary flex-1">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary flex-1">
                                    <Check className="w-4 h-4" />
                                    {editingId ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Services List */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service, index) => (
                    <div
                        key={service.id}
                        className="card animate-fadeIn"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                                <Scissors className="w-6 h-6 text-pink-400" />
                            </div>
                            {canModify(service) && (
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(service)}
                                        className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-white transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(e, service)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <h3 className="font-semibold text-lg mb-3">{service.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{service.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1 text-green-400">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold">
                                    {service.price.toLocaleString('es-CL')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {services.length === 0 && (
                <div className="text-center py-12">
                    <Scissors className="w-16 h-16 mx-auto text-[var(--color-text-muted)] opacity-50 mb-4" />
                    <p className="text-[var(--color-text-muted)]">No hay servicios registrados</p>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4">
                        <Plus className="w-4 h-4" />
                        Agregar Primer Servicio
                    </button>
                </div>
            )}
        </div>
    );
}

export default ServicesPage;
