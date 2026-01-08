/**
 * LocalStorage service for data persistence
 * Ready to be replaced with API calls in the future
 */

const KEYS = {
    SERVICES: 'salon_services',
    STAFF: 'salon_staff',
    CLIENTS: 'salon_clients',
    APPOINTMENTS: 'salon_appointments',
    SETUP_COMPLETE: 'salon_setup_complete',
    ADMIN_USER: 'salon_admin_user',
};

// Helper to safely parse JSON from localStorage
const getFromStorage = (key, fallback) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return fallback;
    }
};

// Helper to save data to localStorage
const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
        return false;
    }
};

// Check if first-time setup is needed
export const isSetupComplete = () => {
    return getFromStorage(KEYS.SETUP_COMPLETE, false);
};

// Complete the first-time setup
export const completeSetup = (adminUser) => {
    saveToStorage(KEYS.ADMIN_USER, adminUser);
    saveToStorage(KEYS.SETUP_COMPLETE, true);
    // Initialize with empty data
    saveToStorage(KEYS.SERVICES, []);
    saveToStorage(KEYS.STAFF, []);
    saveToStorage(KEYS.CLIENTS, []);
    saveToStorage(KEYS.APPOINTMENTS, []);
};

// Get admin credentials
export const getAdminUser = () => {
    return getFromStorage(KEYS.ADMIN_USER, null);
};

// Services CRUD
export const getServices = () => getFromStorage(KEYS.SERVICES, []);
export const saveServices = (services) => saveToStorage(KEYS.SERVICES, services);

export const addService = (service) => {
    const services = getServices();
    const newService = { ...service, id: crypto.randomUUID() };
    services.push(newService);
    saveServices(services);
    return newService;
};

export const updateService = (id, updates) => {
    const services = getServices();
    const index = services.findIndex((s) => s.id === id);
    if (index !== -1) {
        services[index] = { ...services[index], ...updates };
        saveServices(services);
        return services[index];
    }
    return null;
};

export const deleteService = (id) => {
    const services = getServices().filter((s) => s.id !== id);
    saveServices(services);
    return true;
};

// Staff CRUD
export const getStaff = () => getFromStorage(KEYS.STAFF, []);
export const saveStaff = (staff) => saveToStorage(KEYS.STAFF, staff);

export const addStaffMember = (member) => {
    const staff = getStaff();
    const newMember = {
        ...member,
        id: crypto.randomUUID(),
        color: member.color || `hsl(${Math.random() * 360}, 70%, 60%)`,
    };
    staff.push(newMember);
    saveStaff(staff);
    return newMember;
};

export const updateStaffMember = (id, updates) => {
    const staff = getStaff();
    const index = staff.findIndex((s) => s.id === id);
    if (index !== -1) {
        staff[index] = { ...staff[index], ...updates };
        saveStaff(staff);
        return staff[index];
    }
    return null;
};

export const deleteStaffMember = (id) => {
    const staff = getStaff().filter((s) => s.id !== id);
    saveStaff(staff);
    return true;
};

// Clients CRUD
export const getClients = () => getFromStorage(KEYS.CLIENTS, []);
export const saveClients = (clients) => saveToStorage(KEYS.CLIENTS, clients);

export const addClient = (client) => {
    const clients = getClients();
    const newClient = {
        ...client,
        id: crypto.randomUUID(),
        history: [],
    };
    clients.push(newClient);
    saveClients(clients);
    return newClient;
};

export const updateClient = (id, updates) => {
    const clients = getClients();
    const index = clients.findIndex((c) => c.id === id);
    if (index !== -1) {
        clients[index] = { ...clients[index], ...updates };
        saveClients(clients);
        return clients[index];
    }
    return null;
};

export const deleteClient = (id) => {
    const clients = getClients().filter((c) => c.id !== id);
    saveClients(clients);
    return true;
};

// Appointments CRUD
export const getAppointments = () => getFromStorage(KEYS.APPOINTMENTS, []);
export const saveAppointments = (appointments) => saveToStorage(KEYS.APPOINTMENTS, appointments);

export const addAppointment = (appointment) => {
    const appointments = getAppointments();
    const newAppointment = {
        ...appointment,
        id: crypto.randomUUID(),
        status: appointment.status || 'pending',
    };
    appointments.push(newAppointment);
    saveAppointments(appointments);
    return newAppointment;
};

export const updateAppointment = (id, updates) => {
    const appointments = getAppointments();
    const index = appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
        appointments[index] = { ...appointments[index], ...updates };
        saveAppointments(appointments);
        return appointments[index];
    }
    return null;
};

export const deleteAppointment = (id) => {
    const appointments = getAppointments().filter((a) => a.id !== id);
    saveAppointments(appointments);
    return true;
};

// Get appointments for a specific date
export const getAppointmentsByDate = (date) => {
    return getAppointments().filter((apt) => apt.date === date);
};

// Get appointments for a specific staff member
export const getAppointmentsByStaff = (staffId) => {
    return getAppointments().filter((apt) => apt.staffId === staffId);
};

// Reset all data (clears everything including setup)
export const resetAllData = () => {
    localStorage.removeItem(KEYS.SERVICES);
    localStorage.removeItem(KEYS.STAFF);
    localStorage.removeItem(KEYS.CLIENTS);
    localStorage.removeItem(KEYS.APPOINTMENTS);
    localStorage.removeItem(KEYS.SETUP_COMPLETE);
    localStorage.removeItem(KEYS.ADMIN_USER);
};
