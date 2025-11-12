const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");

// Rutas de prueba
router.get("/", testController.getHello);
router.post("/", testController.postEcho);

module.exports = router;
