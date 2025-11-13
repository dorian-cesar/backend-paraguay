const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/seat.controller');

router.post('/reserve', ctrl.reserveSeat);

router.post('/confirm', ctrl.confirmSeat);

router.post('/release', ctrl.releaseSeat);

router.get('/service/:serviceId', ctrl.getServiceSeats);

module.exports = router;