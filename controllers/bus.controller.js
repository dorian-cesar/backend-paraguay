const Bus = require("../models/Bus");

// Crear bus
exports.createBus = async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.status(201).json(bus);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Listar todos los buses
exports.getBuses = async (req, res) => {
  try {
    const buses = await Bus.find().populate("layout");
    res.json(buses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener bus por ID
exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate("layout");
    if (!bus) {
      return res.status(404).json({ message: "Bus no encontrado" });
    }
    res.json(bus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar bus
exports.updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("layout");
    if (!bus) {
      return res.status(404).json({ message: "Bus no encontrado" });
    }
    res.json(bus);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar bus
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: "Bus no encontrado" });
    }
    res.json({ message: "Bus eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
