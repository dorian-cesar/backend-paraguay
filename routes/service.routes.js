const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/service.controller');
const authMiddleware = require("../middlewares/auth.middleware");


router.post('/generate', authMiddleware({ allowedRoles: ['superAdmin'] }), ctrl.generateServices);
router.post('/generate-all', authMiddleware({ allowedRoles: ['superAdmin'] }), ctrl.generateServicesForAllActiveRoutes);

// Listar servicios
router.get('/', ctrl.getServices);
router.get('/filter', ctrl.getServicesByFilter);
router.get('/:id', ctrl.getServicesByID);

// tripulacion
router.put('/:id/assign', authMiddleware({ allowedRoles: ['superAdmin', 'admin'] }), ctrl.assignBusAndCrew);

// far
router.put('/:id/far', authMiddleware({ allowedRoles: ['superAdmin', 'admin'] }), ctrl.assignFar);
router.put('/:id/far/expenses', authMiddleware({ allowedRoles: ['superAdmin', 'admin'] }), ctrl.addFarExpenses);


module.exports = router;
