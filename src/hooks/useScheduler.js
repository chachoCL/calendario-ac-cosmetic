/**
 * Scheduler Hook
 * Manages appointments with API
 */

import { useState, useCallback } from 'react';
import { appointmentsAPI } from '../services/api';

export function useScheduler() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAppointments = useCallback(async (date) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await appointmentsAPI.getAll(date);
            setAppointments(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createAppointment = useCallback(async (appointmentData) => {
        try {
            const newAppointment = await appointmentsAPI.create(appointmentData);
            setAppointments((prev) => [...prev, newAppointment]);
            return { success: true, appointment: newAppointment };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, []);

    const modifyAppointment = useCallback(async (id, updates) => {
        try {
            const updated = await appointmentsAPI.update(id, updates);
            setAppointments((prev) =>
                prev.map((apt) => (apt.id === id ? { ...apt, ...updated } : apt))
            );
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, []);

    const cancelAppointment = useCallback(async (id) => {
        try {
            await appointmentsAPI.delete(id);
            setAppointments((prev) => prev.filter((apt) => apt.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, []);

    return {
        appointments,
        isLoading,
        error,
        fetchAppointments,
        createAppointment,
        modifyAppointment,
        cancelAppointment,
    };
}

export default useScheduler;
