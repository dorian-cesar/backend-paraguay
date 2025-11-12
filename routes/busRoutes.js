const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');

// Crear
router.post('/', busController.createBus);

// Listar todos
router.get('/', busController.getBuses);

// Obtener por ID
router.get('/:id', busController.getBusById);

// Actualizar
router.put('/:id', busController.updateBus);

// Eliminar
router.delete('/:id', busController.deleteBus);

module.exports = router;
