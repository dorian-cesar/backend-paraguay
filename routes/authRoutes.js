const { Router } = require("express");
const ctrl = require("../controllers/authController");
const rateLimit = require("express-rate-limit");
const authRegister = require("../middlewares/authRegister");
const router = Router();

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10,                   // max 10 intentos
    message: { message: "Demasiados intentos. Intenta más tarde." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/email", limiter, ctrl.loginEmail);
router.post("/rut", limiter, ctrl.loginRut);
router.post("/register", authRegister(), limiter, ctrl.createUser);

module.exports = router;
