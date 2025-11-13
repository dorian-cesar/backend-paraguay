const RouteMaster = require('../models/RouteMaster');

function validateRoutePayload(payload) {
  const errors = [];

  // origen y destino distintos
  if (payload.origin && payload.destination && payload.origin.toString() === payload.destination.toString()) {
    errors.push('origin y destination no pueden ser la misma ciudad.');
  }

  // tiempos positivos
  if (payload.startTime != null && typeof payload.startTime === 'number' && payload.startTime < 0) {
    errors.push('startTime debe ser un número positivo.');
  }
  if (payload.durationMinutes != null && typeof payload.durationMinutes === 'number' && payload.durationMinutes <= 0) {
    errors.push('durationMinutes debe ser un número mayor que 0.');
  }

  // stops: orders únicos y consistentes (si vienen)
  if (Array.isArray(payload.stops) && payload.stops.length > 0) {
    const orders = payload.stops.map(s => s.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
      errors.push('Las paradas deben tener valores de "order" únicos.');
    }
  }

  return errors;
}

exports.createRouteMaster = async (req, res) => {
  try {
    const payload = req.body || {};

    const validationErrors = validateRoutePayload(payload);
    if (validationErrors.length) {
      return res.status(400).json({ success: false, message: 'Datos inválidos.', details: validationErrors });
    }

    const route = new RouteMaster(payload);
    await route.save();

    return res.status(200).json({
      success: true,
      message: 'Ruta maestra creada correctamente.',
      id: route._id
    });
  } catch (err) {
    // Duplicate key (name unique, etc.)
    if (err?.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'campo único';
      return res.status(409).json({ success: false, message: `Ya existe una ruta con ese ${field}.` });
    }

    if (err?.name === 'ValidationError') {
      return res.status(422).json({ success: false, message: 'Error de validación al crear la ruta.', details: err.errors });
    }

    console.error('createRouteMaster error:', err);
    return res.status(400).json({ success: false, message: 'Error al crear la ruta maestra.', error: err.message });
  }
};

exports.getRouteMasters = async (req, res) => {
  try {
    const routes = await RouteMaster.find()
      .populate('layout')
      .populate('origin')
      .populate('destination');

    return res.status(200).json({ success: true, data: routes });
  } catch (err) {
    console.error('getRouteMasters error:', err);
    return res.status(500).json({ success: false, message: 'Error al obtener rutas maestras.', error: err.message });
  }
};

exports.getRouteMasterById = async (req, res) => {
  try {
    const route = await RouteMaster.findById(req.params.id)
      .populate('layout')
      .populate('origin')
      .populate('destination')
      .populate('stops.city');

    if (!route) {
      return res.status(404).json({ success: false, message: 'Ruta maestra no encontrada.' });
    }

    return res.status(200).json({ success: true, data: route });
  } catch (err) {
    console.error('getRouteMasterById error:', err);
    return res.status(500).json({ success: false, message: 'Error al obtener la ruta maestra.', error: err.message });
  }
};

exports.updateRouteMaster = async (req, res) => {
  try {
    const payload = req.body || {};
    const validationErrors = validateRoutePayload(payload);
    if (validationErrors.length) {
      return res.status(400).json({ success: false, message: 'Datos inválidos.', details: validationErrors });
    }

    const route = await RouteMaster.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    )
      .populate('layout')
      .populate('origin')
      .populate('destination');

    if (!route) {
      return res.status(404).json({ success: false, message: 'Ruta maestra no encontrada.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Ruta maestra actualizada correctamente.',
      id: route._id
    });
  } catch (err) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'campo único';
      return res.status(409).json({ success: false, message: `Actualización fallida: ya existe otra ruta con ese ${field}.` });
    }

    if (err?.name === 'ValidationError') {
      return res.status(422).json({ success: false, message: 'Error de validación al actualizar la ruta.', details: err.errors });
    }

    console.error('updateRouteMaster error:', err);
    return res.status(400).json({ success: false, message: 'Error al actualizar la ruta maestra.', error: err.message });
  }
};

exports.deleteRouteMaster = async (req, res) => {
  try {
    const route = await RouteMaster.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Ruta maestra no encontrada.' });
    }
    return res.status(200).json({ success: true, message: 'Ruta maestra eliminada correctamente.' });
  } catch (err) {
    console.error('deleteRouteMaster error:', err);
    return res.status(500).json({ success: false, message: 'Error al eliminar la ruta maestra.', error: err.message });
  }
};

exports.getRouteOrigins = async (req, res) => {
  try {
    const routes = await RouteMaster.find().populate('origin').lean();

    if (!routes.length) {
      return res.status(200).json({ success: true, count: 0, origins: [] });
    }

    const originsSet = new Set();
    routes.forEach(route => {
      if (route.origin && route.origin.name) originsSet.add(route.origin.name);
    });

    const origins = Array.from(originsSet).sort();
    return res.status(200).json({ success: true, count: origins.length, origins });
  } catch (err) {
    console.error('getRouteOrigins error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener orígenes.', error: err.message });
  }
};

exports.getRouteDestinations = async (req, res) => {
  try {
    const routes = await RouteMaster.find().populate('destination').lean();

    if (!routes.length) {
      return res.status(200).json({ success: true, count: 0, destinations: [] });
    }

    const destinationsSet = new Set();
    routes.forEach(route => {
      if (route.destination && route.destination.name) destinationsSet.add(route.destination.name);
    });

    const destinations = Array.from(destinationsSet).sort();
    return res.status(200).json({ success: true, count: destinations.length, destinations });
  } catch (err) {
    console.error('getRouteDestinations error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener destinos.', error: err.message });
  }
};

exports.getRouteStops = async (req, res) => {
  try {
    const route = await RouteMaster.findById(req.params.id)
      .populate('stops.city')
      .populate('origin')
      .populate('destination');

    if (!route) {
      return res.status(404).json({ success: false, message: 'Ruta no encontrada.' });
    }

    // Construir lista de paradas normalizadas
    const originObj = route.origin ? {
      id: route.origin._id,
      name: route.origin.name,
      order: 0,
      isOrigin: true
    } : null;

    const stops = Array.isArray(route.stops) ? route.stops.map(s => ({
      id: s.city?._id,
      name: s.city?._doc?.name || s.city?.name || null,
      order: s.order,
      offsetMinutes: s.offsetMinutes,
      price: s.price
    })) : [];

    const destinationObj = route.destination ? {
      id: route.destination._id,
      name: route.destination.name,
      order: (stops.length > 0 ? Math.max(...stops.map(s => s.order)) + 1 : 1),
      isDestination: true
    } : null;

    const allStops = [
      ...(originObj ? [originObj] : []),
      ...stops,
      ...(destinationObj ? [destinationObj] : [])
    ];

    // Ordenamos por order (asegurar números)
    allStops.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    return res.status(200).json({
      success: true,
      route: { id: route._id, name: route.name },
      stops: allStops
    });
  } catch (err) {
    console.error('getRouteStops error:', err);
    return res.status(500).json({ success: false, message: 'Error al obtener paradas de la ruta.', error: err.message });
  }
};
