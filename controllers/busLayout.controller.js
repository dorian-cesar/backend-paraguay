const BusLayout = require('../models/BusLayout');

exports.createBusLayout = async (req, res) => {
  try {
    if (req.body.name && typeof req.body.name === 'string') {
      req.body.name = req.body.name.trim();
    }

    const busLayout = new BusLayout(req.body);
    await busLayout.save();

    return res.status(200).json({
      success: true,
      message: 'Layout creado correctamente.',
      id: busLayout._id
    });
  } catch (err) {
    console.error('createBusLayout error:', err);

    if (err?.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'campo único';
      return res.status(409).json({
        success: false,
        message: `Ya existe un layout con ese ${field}.`
      });
    }

    if (err?.name === 'ValidationError') {
      return res.status(422).json({
        success: false,
        message: 'Error de validación al crear layout.',
        details: err.errors
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Error al crear el layout.',
      error: err.message
    });
  }
};

exports.getBusLayouts = async (req, res) => {
  try {
    const layouts = await BusLayout.find().sort({ name: 1 });
    return res.status(200).json({ success: true, data: layouts });
  } catch (err) {
    console.error('getBusLayouts error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los layouts.',
      error: err.message
    });
  }
};

exports.getBusLayoutById = async (req, res) => {
  try {
    const layout = await BusLayout.findById(req.params.id);
    if (!layout) {
      return res.status(404).json({ success: false, message: 'Layout no encontrado.' });
    }
    return res.status(200).json({ success: true, data: layout });
  } catch (err) {
    console.error('getBusLayoutById error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el layout.',
      error: err.message
    });
  }
};

exports.updateBusLayout = async (req, res) => {
  try {
    if (req.body.name && typeof req.body.name === 'string') {
      req.body.name = req.body.name.trim();
    }

    const layout = await BusLayout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!layout) {
      return res.status(404).json({ success: false, message: 'Layout no encontrado.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Layout actualizado correctamente.',
      id: layout._id
    });
  } catch (err) {
    console.error('updateBusLayout error:', err);

    if (err?.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'campo único';
      return res.status(409).json({
        success: false,
        message: `Actualización fallida: ya existe otro layout con ese ${field}.`
      });
    }

    if (err?.name === 'ValidationError') {
      return res.status(422).json({
        success: false,
        message: 'Error de validación al actualizar layout.',
        details: err.errors
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Error al actualizar el layout.',
      error: err.message
    });
  }
};

exports.deleteBusLayout = async (req, res) => {
  try {
    const layout = await BusLayout.findByIdAndDelete(req.params.id);
    if (!layout) {
      return res.status(404).json({ success: false, message: 'Layout no encontrado.' });
    }
    return res.status(200).json({ success: true, message: 'Layout eliminado correctamente.' });
  } catch (err) {
    console.error('deleteBusLayout error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar layout.',
      error: err.message
    });
  }
};
