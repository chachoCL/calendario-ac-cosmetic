/**
 * Services Routes
 * GET /api/services - List all
 * POST /api/services - Create
 * PUT /api/services/:id - Update
 * DELETE /api/services/:id - Delete
 */

import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { authenticate, canModify } from '../auth.js';

const router = express.Router();

router.use(authenticate);

// Get all services
router.get('/', (req, res) => {
    const services = db.prepare(`
    SELECT * FROM services ORDER BY name
  `).all();
    res.json(services);
});

// Create service
router.post('/', (req, res) => {
    const { name, duration, price } = req.body;

    if (!name || !duration || price === undefined) {
        return res.status(400).json({ error: 'Nombre, duración y precio son requeridos' });
    }

    const id = crypto.randomUUID();

    db.prepare(`
    INSERT INTO services (id, name, duration, price, createdBy)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name, duration, price, req.user.id);

    res.json({ id, name, duration, price, createdBy: req.user.id });
});

// Update service
router.put('/:id', canModify, (req, res) => {
    const { id } = req.params;
    const { name, duration, price } = req.body;

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    if (!service) {
        return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Check ownership for non-admins
    if (req.checkOwnership && service.createdBy !== req.user.id) {
        return res.status(403).json({ error: 'No puedes editar servicios de otros usuarios' });
    }

    db.prepare(`
    UPDATE services SET name = ?, duration = ?, price = ? WHERE id = ?
  `).run(name, duration, price, id);

    res.json({ id, name, duration, price });
});

// Delete service
router.delete('/:id', canModify, (req, res) => {
    const { id } = req.params;

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    if (!service) {
        return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Check ownership for non-admins
    if (req.checkOwnership && service.createdBy !== req.user.id) {
        return res.status(403).json({ error: 'No puedes eliminar servicios de otros usuarios' });
    }

    // Check if service has appointments
    const appointments = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE serviceId = ?').get(id);
    if (appointments.count > 0) {
        return res.status(400).json({
            error: `No se puede eliminar: tiene ${appointments.count} cita(s) asociada(s). Elimina las citas primero.`
        });
    }

    try {
        db.prepare('DELETE FROM services WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).json({ error: 'Error al eliminar servicio' });
    }
});

export default router;
