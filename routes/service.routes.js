const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/service.controller');
const role = require("../middlewares/requireRole");


router.post('/generate', role('superAdmin'), ctrl.generateServices);
router.post('/generate-all', role('superAdmin'), ctrl.generateServicesForAllActiveRoutes);

// Listar servicios
router.get('/', ctrl.getServices);
router.get('/filter', ctrl.getServicesByFilter);
router.get('/:id', ctrl.getServicesByID);

// tripulacion
router.put('/:id/assign', ctrl.assignBusAndCrew);

// far
router.put('/:id/far', ctrl.assignFar);
router.put('/:id/far/expenses', ctrl.addFarExpenses);


module.exports = router;
