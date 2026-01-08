/**
 * Appointments Page
 * Full calendar view for appointments management
 */

import { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useScheduler } from '../hooks/useScheduler';
import { servicesAPI, staffAPI, clientsAPI } from '../services/api';
import { BookingModal } from '../components/BookingModal';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    Filter,
} from 'lucide-react';

export function AppointmentsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [filterStaff, setFilterStaff] = useState('');
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [clients, setClients] = useState([]);

    const { appointments, fetchAppointments, isLoading } = useScheduler();

    // Load services, staff, and clients on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [servicesData, staffData, clientsData] = await Promise.all([
                    servicesAPI.getAll(),
                    staffAPI.getAll(),
                    clientsAPI.getAll(),
                ]);
                setServices(servicesData);
                setStaff(staffData);
                setClients(clientsData);
            } catch (err) {
                console.error('Error loading data:', err);
            }
        };
        loadData();
    }, []);

    // Fetch appointments when date changes
    useEffect(() => {
        fetchAppointments(selectedDate);
    }, [selectedDate, fetchAppointments]);

    // Generate week days
    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [currentDate]);

    // Get appointments for selected date with optional staff filter
    const filteredAppointments = useMemo(() => {
        let apts = appointments;
        if (filterStaff) {
            apts = apts.filter((apt) => apt.staffId === filterStaff);
        }
        return apts;
    }, [appointments, filterStaff]);

    // Count appointments per day for the week view
    const appointmentCounts = useMemo(() => {
        const counts = {};
        weekDays.forEach((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            counts[dateStr] = appointments.filter(
                (apt) => apt.date === dateStr && apt.status !== 'cancelled'
            ).length;
        });
        return counts;
    }, [weekDays, appointments]);

    const navigateWeek = (direction) => {
        setCurrentDate((prev) => addDays(prev, direction === 'next' ? 7 : -7));
    };

    const handleBookingComplete = async () => {
        setShowBookingModal(false);
        await fetchAppointments(selectedDate);
        // Reload other data too
        const [servicesData, staffData, clientsData] = await Promise.all([
            servicesAPI.getAll(),
            staffAPI.getAll(),
            clientsAPI.getAll(),
        ]);
        setServices(servicesData);
        setStaff(staffData);
        setClients(clientsData);
    };

    const getService = (id) => services.find((s) => s.id === id);
    const getStaffMember = (id) => staff.find((s) => s.id === id);
    const getClient = (id) => clients.find((c) => c.id === id);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Agenda</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">
                        Vista semanal de citas
                    </p>
                </div>
                <button onClick={() => setShowBookingModal(true)} className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    Nueva Cita
                </button>
            </div>

            {/* Week Navigation */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigateWeek('prev')} className="btn btn-secondary p-3">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold">
                        {format(weekDays[0], "d 'de' MMMM", { locale: es })} -{' '}
                        {format(weekDays[6], "d 'de' MMMM yyyy", { locale: es })}
                    </h2>
                    <button onClick={() => navigateWeek('next')} className="btn btn-secondary p-3">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Week Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isSelected = selectedDate === dateStr;
                        const isToday = isSameDay(day, new Date());
                        const count = appointmentCounts[dateStr] || 0;

                        return (
                            <button
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`p-3 rounded-xl text-center transition-all ${isSelected
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : isToday
                                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                                        : 'bg-[var(--color-surface-elevated)] hover:bg-[var(--color-primary)]/10'
                                    }`}
                            >
                                <div className="text-xs uppercase mb-1 opacity-70">
                                    {format(day, 'EEE', { locale: es })}
                                </div>
                                <div className="text-lg font-bold">{format(day, 'd')}</div>
                                {count > 0 && (
                                    <div
                                        className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-[var(--color-text-muted)]'
                                            }`}
                                    >
                                        {count} cita{count !== 1 ? 's' : ''}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-[var(--color-text-muted)]" />
                <select
                    className="input max-w-xs"
                    value={filterStaff}
                    onChange={(e) => setFilterStaff(e.target.value)}
                >
                    <option value="">Todos los profesionales</option>
                    {staff.map((member) => (
                        <option key={member.id} value={member.id}>
                            {member.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selected Day Appointments */}
            <div className="card">
                <h3 className="font-semibold text-lg mb-4 capitalize">
                    {format(parseISO(selectedDate), "EEEE d 'de' MMMM", { locale: es })}
                </h3>

                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto text-[var(--color-text-muted)] opacity-50 mb-3" />
                        <p className="text-[var(--color-text-muted)]">No hay citas para este día</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredAppointments.map((apt) => {
                            const service = getService(apt.serviceId);
                            const staffMember = getStaffMember(apt.staffId);
                            const client = getClient(apt.clientId);

                            return (
                                <div
                                    key={apt.id}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface-elevated)] border-l-4"
                                    style={{ borderLeftColor: staffMember?.color || 'var(--color-primary)' }}
                                >
                                    <div className="text-center min-w-[60px]">
                                        <div className="text-lg font-bold">{apt.time}</div>
                                        <div className="text-xs text-[var(--color-text-muted)]">
                                            {service?.duration}min
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{service?.name}</div>
                                        <div className="text-sm text-[var(--color-text-muted)] truncate">
                                            {client?.name} • {staffMember?.name}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-green-400 font-semibold">
                                            ${service?.price?.toLocaleString('es-CL') || 0}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <BookingModal
                    onClose={() => setShowBookingModal(false)}
                    onComplete={handleBookingComplete}
                    initialDate={selectedDate}
                    services={services}
                    staff={staff}
                    clients={clients}
                />
            )}
        </div>
    );
}

export default AppointmentsPage;
