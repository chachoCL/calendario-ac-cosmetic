/**
 * Users Routes (Admin only)
 * GET /api/users - List all users
 * DELETE /api/users/:id - Delete user
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { authenticate, requireAdmin } from '../auth.js';

const router = express.Router();

// All routes require admin
router.use(authenticate, requireAdmin);

// Get all users
router.get('/', (req, res) => {
    const users = db.prepare(`
    SELECT id, username, role, createdAt 
    FROM users 
    ORDER BY createdAt DESC
  `).all();

    res.json(users);
});

// Delete user
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user.id) {
        return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Check if user has associated data (FOREIGN KEY constraints protection)
    const checks = [
        { table: 'services', label: 'servicios' },
        { table: 'staff', label: 'personal' },
        { table: 'clients', label: 'clientes' },
        { table: 'appointments', label: 'citas' }
    ];

    for (const check of checks) {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${check.table} WHERE createdBy = ?`).get(id);
        if (count.count > 0) {
            return res.status(400).json({
                error: `No se puede eliminar: el usuario tiene ${count.count} ${check.label} asociados. Elimina o reasigna su contenido primero.`
            });
        }
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ success: true });
});

// Update user password (Admin only)
router.put('/:id/password', (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id);
        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }
});

export default router;
