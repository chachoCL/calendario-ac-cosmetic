/**
 * Staff Routes
 * GET /api/staff - List all
 * POST /api/staff - Create
 * PUT /api/staff/:id - Update
 * DELETE /api/staff/:id - Delete
 */

import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { authenticate, canModify } from '../auth.js';

const router = express.Router();

router.use(authenticate);

// Get all staff
router.get('/', (req, res) => {
    const staff = db.prepare('SELECT * FROM staff ORDER BY name').all();
    // Parse specialties JSON
    const parsed = staff.map(s => ({
        ...s,
        specialties: s.specialties ? JSON.parse(s.specialties) : []
    }));
    res.json(parsed);
});

// Create staff member
router.post('/', (req, res) => {
    const { name, color, specialties = [] } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Nombre es requerido' });
    }

    const id = crypto.randomUUID();
    const specialtiesJson = JSON.stringify(specialties);

    db.prepare(`
    INSERT INTO staff (id, name, color, specialties, createdBy)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name, color, specialtiesJson, req.user.id);

    res.json({ id, name, color, specialties, createdBy: req.user.id });
});

// Update staff member
router.put('/:id', canModify, (req, res) => {
    const { id } = req.params;
    const { name, color, specialties = [] } = req.body;

    const member = db.prepare('SELECT * FROM staff WHERE id = ?').get(id);
    if (!member) {
        return res.status(404).json({ error: 'Personal no encontrado' });
    }

    if (req.checkOwnership && member.createdBy !== req.user.id) {
        return res.status(403).json({ error: 'No puedes editar personal de otros usuarios' });
    }

    const specialtiesJson = JSON.stringify(specialties);

    db.prepare(`
    UPDATE staff SET name = ?, color = ?, specialties = ? WHERE id = ?
  `).run(name, color, specialtiesJson, id);

    res.json({ id, name, color, specialties });
});

// Delete staff member
router.delete('/:id', canModify, (req, res) => {
    const { id } = req.params;

    const member = db.prepare('SELECT * FROM staff WHERE id = ?').get(id);
    if (!member) {
        return res.status(404).json({ error: 'Personal no encontrado' });
    }

    if (req.checkOwnership && member.createdBy !== req.user.id) {
        return res.status(403).json({ error: 'No puedes eliminar personal de otros usuarios' });
    }

    // Check if staff has appointments
    const appointments = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE staffId = ?').get(id);
    if (appointments.count > 0) {
        return res.status(400).json({
            error: `No se puede eliminar: tiene ${appointments.count} cita(s) asociada(s). Elimina las citas primero.`
        });
    }

    try {
        db.prepare('DELETE FROM staff WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting staff:', err);
        res.status(500).json({ error: 'Error al eliminar personal' });
    }
});

export default router;
