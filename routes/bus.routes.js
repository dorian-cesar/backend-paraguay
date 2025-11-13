const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bus.controller');

// Crear
router.post('/', ctrl.createBus);

// Listar todos
router.get('/', ctrl.getBuses);

// Obtener por ID
router.get('/:id', ctrl.getBusById);

// Actualizar
router.put('/:id', ctrl.updateBus);

// Eliminar
router.delete('/:id', ctrl.deleteBus);

module.exports = router;
