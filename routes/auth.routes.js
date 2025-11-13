const { Router } = require("express");
const ctrl = require("../controllers/auth.controller");
const rateLimit = require("express-rate-limit");
const router = Router();

const authMiddleware = require("../middlewares/auth.middleware");

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10,                   // max 10 intentos
    message: { message: "Demasiados intentos. Intenta más tarde." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/email", limiter, ctrl.loginEmail);
router.post("/rut", limiter, ctrl.loginRut);
router.post("/register", auth({ secret: process.env.SECRET }), limiter, ctrl.createUser);

module.exports = router;
