const { Router } = require("express");
const ctrl = require("../controllers/authController");
const rateLimit = require("express-rate-limit");
const router = Router();

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 6,                   // max 6 intentos
    message: { message: "Demasiados intentos fallidos. Intenta más tarde." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/email", loginLimiter, ctrl.loginEmail);
router.post("/rut", loginLimiter, ctrl.loginRut);

module.exports = router;
