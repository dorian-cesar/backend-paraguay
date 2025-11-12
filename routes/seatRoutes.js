const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// Reservar asiento (hold temporal)
router.post('/reserve', seatController.reserveSeat);

// Confirmar asiento
router.post('/confirm', seatController.confirmSeat);

// Liberar asiento
router.post('/release', seatController.releaseSeat);

module.exports = router;
