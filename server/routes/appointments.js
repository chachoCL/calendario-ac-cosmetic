/**
 * Appointments Routes
 * GET /api/appointments - List all (with optional date filter)
 * POST /api/appointments - Create
 * PUT /api/appointments/:id - Update
 * DELETE /api/appointments/:id - Delete
 */

import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { authenticate, canModify } from '../auth.js';

const router = express.Router();

router.use(authenticate);

// Get all appointments (optional date filter)
router.get('/', (req, res) => {
    const { date } = req.query;

    let appointments;
    if (date) {
        appointments = db.prepare(`
      SELECT * FROM appointments WHERE date = ? ORDER BY time
    `).all(date);
    } else {
        appointments = db.prepare(`
      SELECT * FROM appointments ORDER BY date, time
    `).all();
    }

    res.json(appointments);
});

// Create appointment
router.post('/', (req, res) => {
    const { date, time, clientId, serviceId, staffId, notes, status = 'pending' } = req.body;

    if (!date || !time || !clientId || !serviceId || !staffId) {
        return res.status(400).json({ error: 'Fecha, hora, cliente, servicio y personal son requeridos' });
    }

    const id = crypto.randomUUID();

    db.prepare(`
    INSERT INTO appointments (id, date, time, clientId, serviceId, staffId, notes, status, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, date, time, clientId, serviceId, staffId, notes || null, status, req.user.id);

    res.json({ id, date, time, clientId, serviceId, staffId, notes, status, createdBy: req.user.id });
});

// Update appointment
router.put('/:id', canModify, (req, res) => {
    const { id } = req.params;
    const { date, time, clientId, serviceId, staffId, notes, status } = req.body;

    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (req.checkOwnership && appointment.createdBy !== req.user.id) {
        return res.status(403).json({ error: 'No puedes editar citas de otros usuarios' });
    }

    db.prepare(`
    UPDATE appointments 
    SET date = ?, time = ?, clientId = ?, serviceId = ?, staffId = ?, notes = ?, status = ?
    WHERE id = ?
  `).run(date, time, clientId, serviceId, staffId, notes || null, status, id);

    res.json({ id, date, time, clientId, serviceId, staffId, notes, status });
});

// Delete appointment
router.delete('/:id', canModify, (req, res) => {
    const { id } = req.params;

    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (req.checkOwnership && appointment.createdBy !== req.user.id) {
        return res.status(403).json({ error: 'No puedes eliminar citas de otros usuarios' });
    }

    db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
    res.json({ success: true });
});

export default router;
