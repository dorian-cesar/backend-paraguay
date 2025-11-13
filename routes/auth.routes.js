const { Router } = require('express');
const ctrl = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit');
const router = Router();

const auth = require('../middlewares/auth.middleware');

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: { message: "Demasiados intentos. Intenta más tarde." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/email', limiter, ctrl.loginEmail);
router.post('/rut', limiter, ctrl.loginRut);
router.post('/register', limiter, auth({ secret: process.env.SECRET }), ctrl.createUser);

module.exports = router;
