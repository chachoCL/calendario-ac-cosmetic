/**
 * Appointment Card Component
 * Displays individual appointment in the schedule
 */

import { useState } from 'react';
import { Clock, User, Scissors, MoreVertical, Trash2, Check } from 'lucide-react';
import { appointmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from './ConfirmModal';

export function AppointmentCard({ appointment, service, staffMember, client, onUpdate }) {
    const { user, isAdmin } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const canModify = isAdmin || appointment.createdBy === user?.id;

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'badge-success';
            case 'pending':
                return 'badge-warning';
            case 'completed':
                return 'badge-primary';
            case 'cancelled':
                return 'badge-error';
            default:
                return 'badge-primary';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed':
                return 'Confirmada';
            case 'pending':
                return 'Pendiente';
            case 'completed':
                return 'Completada';
            case 'cancelled':
                return 'Cancelada';
            default:
                return status;
        }
    };

    const calculateEndTime = () => {
        if (!service) return '';
        const [hours, minutes] = appointment.time.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + service.duration;
        const endHours = Math.floor(totalMinutes / 60);
        const endMins = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await appointmentsAPI.update(appointment.id, { ...appointment, status: newStatus });
            onUpdate?.();
        } catch (err) {
            console.error('Error updating appointment:', err);
        }
        setShowMenu(false);
    };

    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(false);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await appointmentsAPI.delete(appointment.id);
            onUpdate?.();
        } catch (err) {
            console.error('Error deleting appointment:', err);
        }
        setShowDeleteConfirm(false);
    };

    return (
        <>
            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Cita"
                message={`¿Estás seguro de eliminar la cita de ${client?.name || 'este cliente'}?`}
            />

            <div
                className="card relative animate-slideIn"
                style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: staffMember?.color || 'var(--color-primary)',
                }}
            >
                {/* Header: Time, Status, Price and Menu */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                        <span className="font-semibold text-lg">{appointment.time}</span>
                        <span className="text-[var(--color-text-muted)]">- {calculateEndTime()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Price */}
                        {service && (
                            <span className="text-sm font-semibold text-green-400">
                                ${service.price.toLocaleString('es-CL')}
                            </span>
                        )}
                        {/* Status Badge */}
                        <span className={`badge ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                        </span>
                        {/* Menu Button - only for those who can modify */}
                        {canModify && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
                                >
                                    <MoreVertical className="w-4 h-4 text-[var(--color-text-muted)]" />
                                </button>

                                {/* Dropdown Menu */}
                                {showMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowMenu(false)}
                                        />
                                        <div className="fixed right-4 mt-1 w-48 bg-[var(--color-surface-elevated)] rounded-xl shadow-xl border border-[var(--color-primary)]/20 z-50 overflow-hidden animate-fadeIn">
                                            <button
                                                onClick={() => handleStatusChange('confirmed')}
                                                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-[var(--color-primary)]/10 transition-colors text-left"
                                            >
                                                <Check className="w-4 h-4 text-green-400" />
                                                <span>Confirmar</span>
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange('completed')}
                                                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-[var(--color-primary)]/10 transition-colors text-left"
                                            >
                                                <Check className="w-4 h-4 text-purple-400" />
                                                <span>Completar</span>
                                            </button>
                                            <button
                                                onClick={handleDeleteClick}
                                                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400 text-left"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Eliminar</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Service */}
                <div className="flex items-center gap-2 mb-2">
                    <Scissors className="w-4 h-4 text-pink-400" />
                    <span className="font-medium">{service?.name || 'Servicio no encontrado'}</span>
                    {service && (
                        <span className="text-sm text-[var(--color-text-muted)]">
                            ({service.duration} min)
                        </span>
                    )}
                </div>

                {/* Client */}
                <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>{client?.name || 'Cliente no encontrado'}</span>
                    {client?.phone && (
                        <span className="text-sm text-[var(--color-text-muted)]">{client.phone}</span>
                    )}
                </div>

                {/* Staff */}
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: staffMember?.color || 'var(--color-primary)' }}
                    />
                    <span className="text-sm text-[var(--color-text-muted)]">
                        {staffMember?.name || 'Personal no asignado'}
                    </span>
                </div>

                {/* Notes */}
                {appointment.notes && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-surface-elevated)]">
                        <p className="text-sm text-[var(--color-text-muted)] italic">
                            {appointment.notes}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

export default AppointmentCard;
