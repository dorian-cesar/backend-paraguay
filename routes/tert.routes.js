const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/test.controller");

// Rutas de prueba
router.get("/", ctrl.test);

module.exports = router;
