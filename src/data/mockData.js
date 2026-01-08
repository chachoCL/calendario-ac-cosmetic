// Mock data for initial application state
export const initialServices = [
    {
        id: '1',
        name: 'Manicure Clásica',
        duration: 45,
        price: 15000,
    },
    {
        id: '2',
        name: 'Manicure con Gel',
        duration: 60,
        price: 25000,
    },
    {
        id: '3',
        name: 'Pedicure Spa',
        duration: 60,
        price: 20000,
    },
    {
        id: '4',
        name: 'Uñas Acrílicas',
        duration: 90,
        price: 45000,
    },
    {
        id: '5',
        name: 'Depilación Cejas',
        duration: 15,
        price: 8000,
    },
    {
        id: '6',
        name: 'Depilación Piernas Completas',
        duration: 45,
        price: 25000,
    },
    {
        id: '7',
        name: 'Depilación Brasileña',
        duration: 30,
        price: 20000,
    },
];

export const initialStaff = [
    {
        id: '1',
        name: 'María García',
        specialties: ['Manicure', 'Pedicure', 'Uñas Acrílicas'],
        color: '#8b5cf6',
    },
    {
        id: '2',
        name: 'Ana Rodríguez',
        specialties: ['Depilación', 'Manicure'],
        color: '#f472b6',
    },
    {
        id: '3',
        name: 'Laura Martínez',
        specialties: ['Pedicure', 'Depilación', 'Manicure'],
        color: '#06b6d4',
    },
];

export const initialClients = [
    {
        id: '1',
        name: 'Sofía López',
        phone: '+56 9 1234 5678',
        email: 'sofia.lopez@email.com',
        notes: 'Prefiere esmalte en tonos nude',
        history: [],
    },
    {
        id: '2',
        name: 'Valentina Torres',
        phone: '+56 9 8765 4321',
        email: 'vale.torres@email.com',
        notes: 'Alérgica al látex',
        history: [],
    },
    {
        id: '3',
        name: 'Camila Fernández',
        phone: '+56 9 5555 1234',
        email: 'cami.fernandez@email.com',
        notes: '',
        history: [],
    },
];

// Helper to generate today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

export const initialAppointments = [
    {
        id: '1',
        date: today,
        time: '10:00',
        staffId: '1',
        clientId: '1',
        serviceId: '1',
        status: 'confirmed',
        notes: '',
    },
    {
        id: '2',
        date: today,
        time: '11:00',
        staffId: '2',
        clientId: '2',
        serviceId: '5',
        status: 'confirmed',
        notes: '',
    },
    {
        id: '3',
        date: today,
        time: '14:30',
        staffId: '1',
        clientId: '3',
        serviceId: '4',
        status: 'pending',
        notes: 'Primera vez con acrílicas',
    },
];
