# Beauty Salon - Sistema de Gestión

Sistema de gestión interno para salón de belleza (Uñas, Pedicure, Depilación).

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)

## 🌟 Características

- **Dashboard**: Vista de agenda diaria con estadísticas
- **Gestión de Citas**: Calendario semanal con detección de conflictos
- **CRUD Completo**: Servicios, Personal y Clientes
- **Detección de Conflictos**: Previene doble reserva automáticamente
- **Diseño Responsivo**: Optimizado para tablet y móvil
- **Login Simple**: Credenciales hardcodeadas para MVP

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- npm o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd cosa-papa

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Credenciales de Acceso

```
Usuario: admin
Contraseña: salon2024
```

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── Layout.jsx       # Layout principal con navegación
│   ├── BookingModal.jsx # Modal para crear citas
│   └── AppointmentCard.jsx
├── pages/               # Páginas de la aplicación
│   ├── Dashboard.jsx    # Vista principal
│   ├── AppointmentsPage.jsx # Calendario de citas
│   ├── ClientsPage.jsx  # CRUD de clientes
│   ├── StaffPage.jsx    # CRUD de personal
│   └── ServicesPage.jsx # CRUD de servicios
├── hooks/
│   └── useScheduler.js  # ⭐ Lógica de scheduling con detección de conflictos
├── context/
│   └── AuthContext.jsx  # Autenticación
├── services/
│   └── storage.js       # Persistencia con localStorage
└── data/
    └── mockData.js      # Datos iniciales de ejemplo
```

## 🔧 Hook `useScheduler`

El hook personalizado `useScheduler` contiene la lógica crítica del sistema:

```javascript
const {
  appointments,           // Lista de citas
  checkConflict,          // Verificar conflictos de horario
  getAvailableSlots,      // Obtener horarios disponibles
  bookAppointment,        // Crear cita con validación
  modifyAppointment,      // Modificar cita existente
  cancelAppointment,      // Cancelar cita
} = useScheduler();
```

### Ejemplo de uso:

```javascript
// Verificar si hay conflicto
const conflict = checkConflict(staffId, '2024-01-15', '10:00', 60);
if (conflict.hasConflict) {
  console.error(conflict.message);
}

// Agendar cita
const result = bookAppointment({
  clientId: '1',
  serviceId: '2',
  staffId: '1',
  date: '2024-01-15',
  time: '10:00',
});
```

## 🐳 Despliegue con Docker

```bash
# Construir imagen
docker build -t salon-mvp .

# Ejecutar contenedor
docker run -p 8080:80 salon-mvp

# O con docker-compose
docker-compose up -d
```

La aplicación estará disponible en `http://localhost:8080`

## 📱 Diseño Responsive

- **Desktop (1024px+)**: Sidebar lateral con navegación completa
- **Tablet (768px-1023px)**: Sidebar colapsable
- **Mobile (<768px)**: Navegación inferior (bottom nav)

## 🔮 Preparado para Backend

El sistema usa `localStorage` para persistencia, pero está estructurado para conectar fácilmente a una API:

1. Los servicios en `src/services/storage.js` son fáciles de reemplazar
2. Los hooks abstraen la lógica de datos
3. Los componentes solo consumen datos vía hooks

### Migración a API Real:

```javascript
// storage.js - Cambiar de localStorage a API
export const getServices = async () => {
  const response = await fetch('/api/services');
  return response.json();
};
```

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Linter ESLint
```

## 📄 Licencia

MIT
