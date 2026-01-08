/**
 * Booking Modal Component
 * Form to create new appointments with API
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { appointmentsAPI } from '../services/api';
import {
    X,
    Calendar,
    Clock,
    User,
    UserCircle,
    Scissors,
    AlertCircle,
    CheckCircle,
    StickyNote,
} from 'lucide-react';

// Generate time slots from 9:00 to 19:00
const generateTimeSlots = () => {
    const slots = [];
    for (let h = 9; h < 19; h++) {
        slots.push(`${h.toString().padStart(2, '0')}:00`);
        slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots();

export function BookingModal({ onClose, onComplete, initialDate, services = [], staff = [], clients = [] }) {
    const [formData, setFormData] = useState({
        clientId: '',
        serviceId: '',
        staffId: '',
        date: initialDate || format(new Date(), 'yyyy-MM-dd'),
        time: '',
        notes: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError('');
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.clientId || !formData.serviceId || !formData.staffId || !formData.time) {
            setError('Por favor completa todos los campos requeridos');
            return;
        }

        setIsLoading(true);

        try {
            await appointmentsAPI.create(formData);
            setSuccess(true);
            setTimeout(() => {
                onComplete?.();
            }, 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedService = services.find((s) => s.id === formData.serviceId);
    const selectedStaff = staff.find((s) => s.id === formData.staffId);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-surface-elevated)]">
                    <h2 className="text-xl font-bold">Nueva Cita</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Success message */}
                    {success && (
                        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span>¡Cita agendada exitosamente!</span>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Client */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Cliente *
                        </label>
                        <select
                            className="input"
                            value={formData.clientId}
                            onChange={(e) => handleChange('clientId', e.target.value)}
                            required
                        >
                            <option value="">Seleccionar cliente</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name} - {client.phone}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Service */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <Scissors className="w-4 h-4" />
                            Servicio *
                        </label>
                        <select
                            className="input"
                            value={formData.serviceId}
                            onChange={(e) => handleChange('serviceId', e.target.value)}
                            required
                        >
                            <option value="">Seleccionar servicio</option>
                            {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name} - {service.duration}min - ${service.price.toLocaleString('es-CL')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Staff */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <UserCircle className="w-4 h-4" />
                            Profesional *
                        </label>
                        <select
                            className="input"
                            value={formData.staffId}
                            onChange={(e) => handleChange('staffId', e.target.value)}
                            required
                        >
                            <option value="">Seleccionar profesional</option>
                            {staff.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name} - {member.specialties?.join(', ') || 'General'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Fecha *
                        </label>
                        <input
                            type="date"
                            className="input"
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            required
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Hora *
                        </label>
                        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-[var(--color-surface-elevated)] rounded-lg">
                            {TIME_SLOTS.map((slot) => (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => handleChange('time', slot)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${formData.time === slot
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'bg-[var(--color-surface)] hover:bg-[var(--color-primary)]/20'
                                        }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="label flex items-center gap-2">
                            <StickyNote className="w-4 h-4" />
                            Notas
                        </label>
                        <textarea
                            className="input min-h-[80px] resize-none"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Notas adicionales..."
                        />
                    </div>

                    {/* Summary */}
                    {selectedService && selectedStaff && formData.time && (
                        <div className="p-4 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30">
                            <h4 className="font-semibold mb-2">Resumen</h4>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                {selectedService.name} con {selectedStaff.name}
                            </p>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                {formData.date} a las {formData.time}
                            </p>
                            <p className="text-lg font-bold text-[var(--color-primary)] mt-2">
                                ${selectedService.price.toLocaleString('es-CL')}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={success || isLoading}
                        >
                            {isLoading ? 'Agendando...' : 'Agendar Cita'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BookingModal;
