/**
 * Dashboard Page
 * Main view with today's appointments and quick actions
 */

import { useState, useEffect, useMemo } from 'react';
import { format, addDays, subDays, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useScheduler } from '../hooks/useScheduler';
import { servicesAPI, staffAPI, clientsAPI } from '../services/api';
import { BookingModal } from '../components/BookingModal';
import { AppointmentCard } from '../components/AppointmentCard';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    DollarSign,
} from 'lucide-react';

export function Dashboard() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [clients, setClients] = useState([]);

    const { appointments, fetchAppointments, isLoading } = useScheduler();

    // Load data on mount
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

    // Calculate daily stats
    const stats = useMemo(() => {
        const totalRevenue = appointments.reduce((sum, apt) => {
            const service = services.find((s) => s.id === apt.serviceId);
            return sum + (service?.price || 0);
        }, 0);

        const totalDuration = appointments.reduce((sum, apt) => {
            const service = services.find((s) => s.id === apt.serviceId);
            return sum + (service?.duration || 0);
        }, 0);

        return {
            count: appointments.length,
            revenue: totalRevenue,
            hours: Math.round(totalDuration / 60 * 10) / 10,
        };
    }, [appointments, services]);

    const handleDateChange = (direction) => {
        const currentDate = parseISO(selectedDate);
        const newDate = direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
        setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    };

    const formatDate = (dateStr) => {
        const date = parseISO(dateStr);
        if (isToday(date)) {
            return 'Hoy';
        }
        return format(date, "EEEE d 'de' MMMM", { locale: es });
    };

    const handleBookingComplete = () => {
        setShowBookingModal(false);
        fetchAppointments(selectedDate);
    };

    const refreshData = async () => {
        fetchAppointments(selectedDate);
        const [servicesData, staffData, clientsData] = await Promise.all([
            servicesAPI.getAll(),
            staffAPI.getAll(),
            clientsAPI.getAll(),
        ]);
        setServices(servicesData);
        setStaff(staffData);
        setClients(clientsData);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">
                        Gestiona las citas de tu salón
                    </p>
                </div>
                <button
                    onClick={() => setShowBookingModal(true)}
                    className="btn btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Cita
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-muted)]">Citas Hoy</p>
                        <p className="text-2xl font-bold">{stats.count}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-muted)]">Ingresos</p>
                        <p className="text-2xl font-bold">
                            ${stats.revenue.toLocaleString('es-CL')}
                        </p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-muted)]">Horas</p>
                        <p className="text-2xl font-bold">{stats.hours}h</p>
                    </div>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => handleDateChange('prev')}
                        className="btn btn-secondary p-3"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-lg md:text-xl font-semibold capitalize">
                            {formatDate(selectedDate)}
                        </h2>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            {format(parseISO(selectedDate), 'dd/MM/yyyy')}
                        </p>
                    </div>
                    <button
                        onClick={() => handleDateChange('next')}
                        className="btn btn-secondary p-3"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Date input for quick navigation */}
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input w-full mb-6"
                />

                {/* Appointments List */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 mx-auto text-[var(--color-text-muted)] opacity-50 mb-4" />
                            <p className="text-[var(--color-text-muted)]">
                                No hay citas programadas para este día
                            </p>
                            <button
                                onClick={() => setShowBookingModal(true)}
                                className="btn btn-primary mt-4"
                            >
                                <Plus className="w-4 h-4" />
                                Agendar Primera Cita
                            </button>
                        </div>
                    ) : (
                        appointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                service={services.find((s) => s.id === appointment.serviceId)}
                                staffMember={staff.find((s) => s.id === appointment.staffId)}
                                client={clients.find((c) => c.id === appointment.clientId)}
                                onUpdate={() => fetchAppointments(selectedDate)}
                            />
                        ))
                    )}
                </div>
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

export default Dashboard;
