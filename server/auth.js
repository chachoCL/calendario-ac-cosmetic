/**
 * JWT Authentication Middleware
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'salon-secret-key-change-in-production';
const JWT_EXPIRES = '7d';

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
}

// Verify JWT token middleware
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

// Check if user is admin
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
}

// Check if user can modify resource (owner or admin)
function canModify(req, res, next) {
    // Admin can modify anything
    if (req.user.role === 'admin') {
        return next();
    }

    // For non-admins, we'll check ownership in the route handler
    // by adding a flag to the request
    req.checkOwnership = true;
    next();
}

export {
    generateToken,
    authenticate,
    requireAdmin,
    canModify,
    JWT_SECRET,
};
