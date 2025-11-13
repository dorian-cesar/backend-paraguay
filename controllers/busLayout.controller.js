const BusLayout = require('../models/BusLayout');

// Crear un nuevo layout
exports.createBusLayout = async (req, res) => {
  try {
    const busLayout = new BusLayout(req.body);
    await busLayout.save();
    res.status(201).json(busLayout);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error al crear el layout', error: err.message });
  }
};

// Obtener todos los layouts
exports.getBusLayouts = async (req, res) => {
  try {
    const layouts = await BusLayout.find();
    res.json(layouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener layouts' });
  }
};

// Obtener layout por ID
exports.getBusLayoutById = async (req, res) => {
  try {
    const layout = await BusLayout.findById(req.params.id);
    if (!layout) {
      return res.status(404).json({ message: 'Layout no encontrado' });
    }
    res.json(layout);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener layout' });
  }
};

// Actualizar layout
exports.updateBusLayout = async (req, res) => {
  try {
    const layout = await BusLayout.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!layout) {
      return res.status(404).json({ message: 'Layout no encontrado' });
    }
    res.json(layout);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error al actualizar layout', error: err.message });
  }
};

// Eliminar layout
exports.deleteBusLayout = async (req, res) => {
  try {
    const layout = await BusLayout.findByIdAndDelete(req.params.id);
    if (!layout) {
      return res.status(404).json({ message: 'Layout no encontrado' });
    }
    res.json({ message: 'Layout eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar layout' });
  }
};
