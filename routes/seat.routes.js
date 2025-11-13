const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/seat.controller');

// Reservar asiento (hold temporal)
router.post('/reserve', ctrl.reserveSeat);

// Confirmar asiento
router.post('/confirm', ctrl.confirmSeat);

// Liberar asiento
router.post('/release', ctrl.releaseSeat);

module.exports = router;
