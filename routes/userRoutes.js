const { Router } = require("express");
const ctrl = require("../controllers/userController");
const rateLimit = require("express-rate-limit");

const router = Router();

const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5,                   // max 5 cuentas por IP por hora
    message: { message: "Demasiadas cuentas creadas. Intenta más tarde." },
    standardHeaders: true,
    legacyHeaders: false,
});

// CRUD
router.get("/", ctrl.getUsers);
router.get("/crew", ctrl.getCrewUsers);
router.get("/:id", ctrl.getUserById);
router.post("/", createAccountLimiter, ctrl.createUser);
router.put("/:id", ctrl.updateUser);
router.delete("/:id", ctrl.deleteUser);
router.patch("/:id/activar", ctrl.toggleActivo);

module.exports = router;
