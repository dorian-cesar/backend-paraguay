const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const role = require("../middlewares/requireRole");


router.post('/generate', role('superAdmin'), serviceController.generateServices);
router.post('/generate-all', role('superAdmin'), serviceController.generateServicesForAllActiveRoutes);

// Listar servicios
router.get('/', serviceController.getServices);
router.get('/filter', serviceController.getServicesByFilter);
router.get('/:id', serviceController.getServicesByID);

// tripulacion
router.put('/:id/assign', serviceController.assignBusAndCrew);

// far
router.put('/:id/far', serviceController.assignFar);
router.put('/:id/far/expenses', serviceController.addFarExpenses);


module.exports = router;
