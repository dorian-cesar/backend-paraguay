const jwt = require('jsonwebtoken');

module.exports = function auth(options = {}) {
  const {
    secret = process.env.JWT_SECRET,
    allowedRoles = []
  } = options;

  if (!secret) {
    console.error('JWT secret no definido para auth middleware');
    throw new Error('JWT secret no definido en auth middleware');
  }

  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

      if (!token) return res.status(401).json({ message: 'Token faltante.' });

      const payload = jwt.verify(token, secret);

      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      };

      if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({ message: 'No tienes permisos para acceder a este recurso.' });
        }
      }

      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expirado.' });
      if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Token inválido.' });
      console.error('auth middleware error:', err);
      return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
  };
};
