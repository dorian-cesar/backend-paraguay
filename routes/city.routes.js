const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/city.controller');

router.post('/', ctrl.createCity);
router.get('/', ctrl.getCities);
router.get('/:id', ctrl.getCityById);
router.put('/:id', ctrl.updateCity);
router.delete('/:id', ctrl.deleteCity);

module.exports = router;