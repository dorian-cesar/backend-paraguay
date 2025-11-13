const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/busLayout.controller');

// Crear
router.post('/', ctrl.createBusLayout);

// Listar todos
router.get('/', ctrl.getBusLayouts);

// Obtener por ID
router.get('/:id', ctrl.getBusLayoutById);

// Actualizar
router.put('/:id', ctrl.updateBusLayout);

// Eliminar
router.delete('/:id', ctrl.deleteBusLayout);

module.exports = router;
