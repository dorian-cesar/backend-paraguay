const Bus = require("../models/Bus");

exports.createBus = async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();

    return res.status(200).json({
      success: true,
      message: "Bus creado correctamente.",
      id: bus._id // opcional: id para el cliente
    });
  } catch (err) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "campo único";
      return res.status(409).json({
        success: false,
        message: `Ya existe un bus con ese ${field}.`
      });
    }

    if (err?.name === "ValidationError") {
      return res.status(422).json({
        success: false,
        message: "Error de validación al crear el bus.",
        details: err.errors
      });
    }

    return res.status(400).json({
      success: false,
      message: "Error al crear el bus.",
      error: err.message
    });
  }
};

exports.getBuses = async (req, res) => {
  try {
    const buses = await Bus.find().populate("layout");
    return res.status(200).json({ success: true, data: buses });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener buses.",
      error: err.message
    });
  }
};

exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate("layout");
    if (!bus) {
      return res.status(404).json({ success: false, message: "Bus no encontrado." });
    }
    return res.status(200).json({ success: true, data: bus });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener el bus.",
      error: err.message
    });
  }
};

exports.updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate("layout");
    if (!bus) {
      return res.status(404).json({ success: false, message: "Bus no encontrado." });
    }

    return res.status(200).json({
      success: true,
      message: "Bus actualizado correctamente.",
      id: bus._id // opcional
    });
  } catch (err) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "campo único";
      return res.status(409).json({
        success: false,
        message: `Actualización fallida: ya existe otro registro con ese ${field}.`
      });
    }

    if (err?.name === "ValidationError") {
      return res.status(422).json({
        success: false,
        message: "Error de validación al actualizar el bus.",
        details: err.errors
      });
    }

    return res.status(400).json({
      success: false,
      message: "Error al actualizar el bus.",
      error: err.message
    });
  }
};

exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) {
      return res.status(404).json({ success: false, message: "Bus no encontrado." });
    }
    return res.status(200).json({ success: true, message: "Bus eliminado correctamente." });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el bus.",
      error: err.message
    });
  }
};
