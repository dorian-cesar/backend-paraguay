const RouteMaster = require('../models/RouteMaster');

// Crear ruta maestra
exports.createRouteMaster = async (req, res) => {
  try {
    const route = new RouteMaster(req.body);
    await route.save();
    res.status(201).json(route);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Listar todas las rutas maestras
exports.getRouteMasters = async (req, res) => {
  try {
    const routes = await RouteMaster.find().populate('layout').populate('origin').populate('destination');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener ruta maestra por ID
exports.getRouteMasterById = async (req, res) => {
  try {
    const route = await RouteMaster.findById(req.params.id)
      .populate('layout')
      .populate('origin')
      .populate('destination')
      .populate('stops.city');
    if (!route) {
      return res.status(404).json({ message: 'Ruta maestra no encontrada' });
    }
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar ruta maestra
exports.updateRouteMaster = async (req, res) => {
  try {
    const route = await RouteMaster.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('layout')
      .populate('origin')
      .populate('destination');
    if (!route) {
      return res.status(404).json({ message: 'Ruta maestra no encontrada' });
    }
    res.json(route);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar ruta maestra
exports.deleteRouteMaster = async (req, res) => {
  try {
    const route = await RouteMaster.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Ruta maestra no encontrada' });
    }
    res.json({ message: 'Ruta maestra eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRouteOrigins = async (req, res) => {
  try {
    const routes = await RouteMaster.find().populate('origin').lean();
    if (!routes.length) {
      return res.status(404).json({ message: 'No hay rutas disponibles' });
    }

    const originsSet = new Set();
    routes.forEach(route => {
      if (route.origin && route.origin.name) {
        originsSet.add(route.origin.name);
      }
    });

    const origins = Array.from(originsSet).sort();

    return res.json({
      count: origins.length,
      origins
    });
  } catch (err) {
    console.error('getRouteOrigins error', err);
    return res.status(500).json({ message: 'Error al obtener orígenes' });
  }
};

exports.getRouteDestinations = async (req, res) => {
  try {
    const routes = await RouteMaster.find().populate('destination').lean();
    if (!routes.length) {
      return res.status(404).json({ message: 'No hay rutas disponibles' });
    }

    const destinationsSet = new Set();
    routes.forEach(route => {
      if (route.destination && route.destination.name) {
        destinationsSet.add(route.destination.name);
      }
    });

    const destinations = Array.from(destinationsSet).sort();

    return res.json({
      count: destinations.length,
      destinations
    });
  } catch (err) {
    console.error('getRouteDestinations error', err);
    return res.status(500).json({ message: 'Error al obtener destinos' });
  }
};

// Nuevo método para obtener todas las paradas de una ruta
exports.getRouteStops = async (req, res) => {
  try {
    const route = await RouteMaster.findById(req.params.id)
      .populate('stops.city')
      .populate('origin')
      .populate('destination');

    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }

    const allStops = [
      { ...route.origin.toObject(), order: 0, isOrigin: true },
      ...route.stops.map(stop => ({
        ...stop.city.toObject(),
        order: stop.order,
        offsetMinutes: stop.offsetMinutes,
        price: stop.price
      })),
      { ...route.destination.toObject(), order: route.stops.length + 1, isDestination: true }
    ];

    res.json({
      route: route.name,
      stops: allStops.sort((a, b) => a.order - b.order)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};