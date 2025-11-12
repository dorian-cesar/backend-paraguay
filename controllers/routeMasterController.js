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
    const routes = await RouteMaster.find().populate('layout');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener ruta maestra por ID
exports.getRouteMasterById = async (req, res) => {
  try {
    const route = await RouteMaster.findById(req.params.id).populate('layout');
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
      .populate('layout');
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

exports.getOriginsByDirection = async (req, res) => {
  try {
    const { direction } = req.query;

    if (!direction || !['subida', 'bajada'].includes(direction)) {
      return res.status(400).json({ message: 'Parámetro direction requerido y debe ser "subida" o "bajada".' });
    }

    const routes = await RouteMaster.find({ direction }).lean();
    if (!routes.length) {
      return res.status(404).json({ message: 'No hay rutas para esa dirección' });
    }

    let originsSet = new Set();

    if (direction === 'subida') {
      // Recorre los stops de todas las rutas de subida
      for (const r of routes) {
        if (Array.isArray(r.stops)) {
          r.stops.forEach(s => {
            if (s && s.name) originsSet.add(s.name);
          });
        }
      }
    } else {
      // Bajada → origen fijo de cada ruta (generalmente la minera)
      routes.forEach(r => {
        if (r.origin) originsSet.add(r.origin);
      });
    }

    const origins = Array.from(originsSet).sort(); // opcional: orden alfabético

    return res.json({
      direction,
      count: origins.length,
      origins
    });

  } catch (err) {
    console.error('getOriginsByDirection error', err);
    return res.status(500).json({ message: 'Error al obtener orígenes' });
  }
};


exports.getDestinationsByDirection = async (req, res) => {
  try {
    const { direction } = req.query;

    if (!direction || !['subida', 'bajada'].includes(direction)) {
      return res.status(400).json({ message: 'Parámetro direction requerido y debe ser "subida" o "bajada".' });
    }

    const routes = await RouteMaster.find({ direction }).lean();
    if (!routes.length) {
      return res.status(404).json({ message: 'No hay rutas para esa dirección' });
    }

    let destinationsSet = new Set();

    if (direction === 'subida') {
      // Subida → destino fijo de cada ruta (generalmente la minera)
      routes.forEach(r => {
        if (r.destination) destinationsSet.add(r.destination);
      });
    } else {
      // Bajada → Recorre los stops de todas las rutas de bajada
      for (const r of routes) {
        if (Array.isArray(r.stops)) {
          r.stops.forEach(s => {
            if (s && s.name) destinationsSet.add(s.name);
          });
        }
      }
    }

    const destinations = Array.from(destinationsSet).sort(); // opcional: orden alfabético

    return res.json({
      direction,
      count: destinations.length,
      destinations
    });

  } catch (err) {
    console.error('getDestinationsByDirection error', err);
    return res.status(500).json({ message: 'Error al obtener destinos' });
  }
};