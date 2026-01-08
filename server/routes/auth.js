/**
 * Authentication Routes
 * POST /api/auth/setup - Initial admin setup
 * POST /api/auth/login - User login
 * GET /api/auth/me - Get current user
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db, isSetupComplete, createAdminUser, verifyUser } from '../db.js';
import { generateToken, authenticate } from '../auth.js';

const router = express.Router();

// Check if setup is needed
router.get('/status', (req, res) => {
    res.json({ setupComplete: isSetupComplete() });
});

// Initial admin setup
router.post('/setup', (req, res) => {
    if (isSetupComplete()) {
        return res.status(400).json({ error: 'El sistema ya está configurado' });
    }

    const { username, password } = req.body;

    if (!username || username.length < 3) {
        return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
        const user = createAdminUser(username, password);
        const token = generateToken(user);
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear usuario admin' });
    }
});

// User login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const user = verifyUser(username, password);

    if (!user) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = generateToken(user);
    res.json({ user, token });
});

// Get current user info
router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

// Register new user (admin only creates users, or first admin self-registers)
router.post('/register', authenticate, (req, res) => {
    // Only admin can create users
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Solo el administrador puede crear usuarios' });
    }

    const { username, password, role = 'user' } = req.body;

    if (!username || username.length < 3) {
        return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Check if username exists
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
        return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const id = crypto.randomUUID();

        db.prepare(`
      INSERT INTO users (id, username, password, role, createdBy)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, username, hashedPassword, role, req.user.id);

        res.json({ id, username, role });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

export default router;
