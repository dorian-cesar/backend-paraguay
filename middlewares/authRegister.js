const jwt = require('jsonwebtoken');

module.exports = function authRegister() {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization || '';
            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

            if (!token) return res.status(401).json({ message: 'Token faltante.' });

            const payload = jwt.verify(token, process.env.SECRET);

            req.user = {
                id: payload.id,
                email: payload.email,
                role: payload.role,
                name: payload.name
            };

            next();
        } catch (err) {
            // Mensajes diferenciados para debugging/cliente
            if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expirado.' });
            if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Token inválido.' });
            console.error('authRegister error:', err);
            return res.status(401).json({ message: 'Token inválido o expirado.' });
        }
    };
}