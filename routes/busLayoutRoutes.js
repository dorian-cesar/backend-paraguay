const express = require('express');
const router = express.Router();
const busLayoutController = require('../controllers/busLayoutController');

// Crear
router.post('/', busLayoutController.createBusLayout);

// Listar todos
router.get('/', busLayoutController.getBusLayouts);

// Obtener por ID
router.get('/:id', busLayoutController.getBusLayoutById);

// Actualizar
router.put('/:id', busLayoutController.updateBusLayout);

// Eliminar
router.delete('/:id', busLayoutController.deleteBusLayout);

module.exports = router;
