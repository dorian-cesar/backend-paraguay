const { validDate } = require("../utils/fechaChile");

module.exports = (req, res, next) => {
    try {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'No autenticado.' });
        }

        if (req.user.role === 'contratista' && !validDate()) {
            return res.status(403).json({
                message: 'Acceso denegado: si eres contratista solo puedes acceder a partir del día 21 del mes.'
            });
        }

        next();
    } catch (err) {
        console.error('dateRule error:', err);
        return res.status(500).json({ message: 'Error en la validación de fecha.' });
    }
};
