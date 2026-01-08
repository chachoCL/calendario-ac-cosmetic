/**
 * Clients Routes
 * GET /api/clients - List all
 * POST /api/clients - Create
 * PUT /api/clients/:id - Update
 * DELETE /api/clients/:id - Delete
 */

import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { authenticate, canModify } from '../auth.js';

const router = express.Router();

router.use(authenticate);

// Get all clients
router.get('/', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    res.json(clients);
});

// Create client
router.post('/', (req, res) => {
    const { name, phone, email, notes } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: 'Nombre y teléfono son requeridos' });
    }

    const id = crypto.randomUUID();

    db.prepare(`
    INSERT INTO clients (id, name, phone, email, notes, createdBy)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name, phone, email || null, notes || null, req.user.id);

    res.json({ id, name, phone, email, notes, createdBy: req.user.id });
});

// Update client
router.put('/:id', canModify, (req, res) => {
    const { id } = req.params;
    const { name, phone, email, notes } = req.body;

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    if (req.checkOwnership && client.createdBy !== req.user.id) {
        return res.status(403).json({ error: 'No puedes editar clientes de otros usuarios' });
    }

    db.prepare(`
    UPDATE clients SET name = ?, phone = ?, email = ?, notes = ? WHERE id = ?
  `).run(name, phone, email || null, notes || null, id);

    res.json({ id, name, phone, email, notes });
});

// Delete client
router.delete('/:id', canModify, (req, res) => {
    const { id } = req.params;

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    if (req.checkOwnership && client.createdBy !== req.user.id) {
        return res.status(403).json({ error: 'No puedes eliminar clientes de otros usuarios' });
    }

    // Check if client has appointments
    const appointments = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE clientId = ?').get(id);
    if (appointments.count > 0) {
        return res.status(400).json({
            error: `No se puede eliminar: tiene ${appointments.count} cita(s) asociada(s). Elimina las citas primero.`
        });
    }

    try {
        db.prepare('DELETE FROM clients WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting client:', err);
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
});

export default router;
