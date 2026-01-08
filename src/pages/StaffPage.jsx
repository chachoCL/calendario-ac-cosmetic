/**
 * Staff Page
 * CRUD for managing salon staff members
 */

import { useState, useEffect } from 'react';
import { staffAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { UserCircle, Plus, Edit, Trash2, X, Check, AlertCircle } from 'lucide-react';

const SPECIALTY_OPTIONS = [
    'Manicure',
    'Pedicure',
    'Uñas Acrílicas',
    'Depilación',
    'Uñas en Gel',
    'Nail Art',
];

const COLOR_OPTIONS = [
    '#8b5cf6', '#f472b6', '#06b6d4', '#10b981',
    '#f59e0b', '#ef4444', '#6366f1', '#ec4899',
];

export function StaffPage() {
    const { user, isAdmin } = useAuth();
    const [staff, setStaff] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', specialties: [], color: COLOR_OPTIONS[0] });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        refreshStaff();
    }, []);

    const refreshStaff = async () => {
        try {
            const data = await staffAPI.getAll();
            setStaff(data);
        } catch (err) {
            setError('Error al cargar personal');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingId) {
                await staffAPI.update(editingId, formData);
            } else {
                await staffAPI.create(formData);
            }
            resetForm();
            refreshStaff();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (member) => {
        setEditingId(member.id);
        setFormData({
            name: member.name,
            specialties: member.specialties || [],
            color: member.color || COLOR_OPTIONS[0],
        });
        setShowForm(true);
    };

    const handleDeleteClick = (e, member) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirm({ open: true, id: member.id, name: member.name });
    };

    const handleDeleteConfirm = async () => {
        try {
            await staffAPI.delete(deleteConfirm.id);
            refreshStaff();
        } catch (err) {
            setError(err.message);
        }
        setDeleteConfirm({ open: false, id: null, name: '' });
    };

    const toggleSpecialty = (specialty) => {
        setFormData((prev) => ({
            ...prev,
            specialties: prev.specialties.includes(specialty)
                ? prev.specialties.filter((s) => s !== specialty)
                : [...prev.specialties, specialty],
        }));
    };

    const canModify = (member) => isAdmin || member.createdBy === user?.id;

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', specialties: [], color: COLOR_OPTIONS[0] });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Personal</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">Administra el equipo del salón</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    Nuevo Profesional
                </button>
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
                title="Eliminar Profesional"
                message={`¿Estás seguro de eliminar a "${deleteConfirm.name}"?`}
            />

            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-[var(--color-surface-elevated)]">
                            <h2 className="text-xl font-bold">{editingId ? 'Editar Profesional' : 'Nuevo Profesional'}</h2>
                            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">Nombre Completo</label>
                                <input type="text" className="input" value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: María García" required />
                            </div>
                            <div>
                                <label className="label">Color Identificador</label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLOR_OPTIONS.map((color) => (
                                        <button key={color} type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            className="w-10 h-10 rounded-xl transition-transform hover:scale-110"
                                            style={{ backgroundColor: color, outline: formData.color === color ? '3px solid white' : 'none', outlineOffset: '2px' }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="label">Especialidades</label>
                                <div className="flex gap-2 flex-wrap">
                                    {SPECIALTY_OPTIONS.map((specialty) => (
                                        <button key={specialty} type="button" onClick={() => toggleSpecialty(specialty)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.specialties.includes(specialty)
                                                    ? 'bg-[var(--color-primary)] text-white'
                                                    : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-white'
                                                }`}
                                        >{specialty}</button>
                                    ))}
                                </div>
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
                {staff.map((member, index) => (
                    <div key={member.id} className="card animate-fadeIn"
                        style={{ animationDelay: `${index * 0.05}s`, borderLeftWidth: '4px', borderLeftColor: member.color || 'var(--color-primary)' }}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                                style={{ backgroundColor: member.color || 'var(--color-primary)' }}>
                                {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            {canModify(member) && (
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(member)}
                                        className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-white transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={(e) => handleDeleteClick(e, member)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <h3 className="font-semibold text-lg mb-3">{member.name}</h3>
                        <div className="flex flex-wrap gap-1">
                            {member.specialties?.map((specialty) => (
                                <span key={specialty} className="badge badge-primary text-xs">{specialty}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {staff.length === 0 && (
                <div className="text-center py-12">
                    <UserCircle className="w-16 h-16 mx-auto text-[var(--color-text-muted)] opacity-50 mb-4" />
                    <p className="text-[var(--color-text-muted)]">No hay personal registrado</p>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4">
                        <Plus className="w-4 h-4" />
                        Agregar Primer Profesional
                    </button>
                </div>
            )}
        </div>
    );
}

export default StaffPage;
