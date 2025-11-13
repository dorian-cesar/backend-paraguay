// controllers/seat.controller.js
const Seat = require('../models/Seat');
const User = require('../models/User');
const Service = require('../models/Service');
const City = require('../models/City');

// RESERVAR asiento (hold temporal)
async function reserveSeat(req, res) {
  try {
    const { serviceId, seatCode, rut, originCityId, destinationCityId } = req.body;

    if (!serviceId || !seatCode || !rut || !originCityId || !destinationCityId) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    // Validar usuario
    const user = await User.findOne({ rut });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Validar servicio y ciudades
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });

    const originCity = await City.findById(originCityId);
    const destinationCity = await City.findById(destinationCityId);
    if (!originCity || !destinationCity) {
      return res.status(404).json({ message: 'Ciudad de origen o destino no encontrada' });
    }


    // Validar que las paradas existen en el servicio
    const originStop = service.departures.find(d => d.stop === originCity.name);
    const destinationStop = service.departures.find(d => d.stop === destinationCity.name);


    if (!originStop || !destinationStop) {
      return res.status(400).json({ message: 'Las ciudades seleccionadas no existen en este servicio' });
    }

    if (originStop.order >= destinationStop.order) {
      return res.status(400).json({ message: 'La ciudad de destino debe estar después de la ciudad de origen' });
    }

    // 🔍 DEPURACIÓN: Ver todos los asientos del servicio
    const allSeats = await Seat.find({ service: serviceId });

    // Buscar asiento específico
    const now = new Date();

    const seat = await Seat.findOne({
      service: serviceId,
      code: seatCode
    });

    if (!seat) {
      return res.status(404).json({ message: 'Asiento no encontrado' });
    }

    // Verificar disponibilidad
    const isAvailable = (
      seat.status === 'available' ||
      (seat.status === 'reserved' && seat.holdUntil && seat.holdUntil < now)
    );


    if (!isAvailable) {
      return res.status(400).json({
        message: 'Asiento no disponible para reserva',
        details: {
          status: seat.status,
          isAvailable: seat.isAvailable,
          holdUntil: seat.holdUntil,
          isHoldExpired: seat.holdUntil && seat.holdUntil < now
        }
      });
    }

    // Realizar reserva temporal (10 minutos)
    await seat.temporaryReserve(user._id, originCityId, destinationCityId, 10);

    const populatedSeat = await Seat.findById(seat._id)
      .populate('passenger.user', 'name rut email')
      .populate('passenger.origin', 'name code')
      .populate('passenger.destination', 'name code');

    res.status(201).json({
      message: `Asiento ${seat.code} reservado temporalmente desde ${originCity.name} hasta ${destinationCity.name}`,
      seat: populatedSeat,
      holdUntil: seat.holdUntil
    });

  } catch (err) {
    console.error('[ERROR] Error en reserveSeat:', err);
    res.status(500).json({ message: 'Error al reservar asiento', error: err.message });
  }
}

// CONFIRMAR asiento (ocupado hasta destino)
async function confirmSeat(req, res) {
  try {
    const { serviceId, seatCode } = req.body;

    if (!serviceId || !seatCode) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const seat = await Seat.findOne({
      service: serviceId,
      code: seatCode,
      status: 'reserved' // Solo se pueden confirmar asientos en estado reserved
    })
      .populate('passenger.user', 'name rut email')
      .populate('passenger.origin', 'name code')
      .populate('passenger.destination', 'name code');

    if (!seat) {
      return res.status(404).json({ message: 'Asiento no encontrado o no está en estado de reserva' });
    }

    // Verificar que la reserva no haya expirado
    if (seat.holdUntil && seat.holdUntil < new Date()) {
      await seat.releaseSeat();
      return res.status(400).json({ message: 'La reserva ha expirado' });
    }

    // Confirmar reserva
    await seat.confirmReservation();

    res.json({
      message: `Asiento ${seat.code} confirmado exitosamente`,
      seat
    });

  } catch (err) {
    console.error('Error en confirmSeat:', err);
    res.status(500).json({ message: 'Error al confirmar asiento', error: err.message });
  }
}

// LIBERAR asiento (volver a disponible)
async function releaseSeat(req, res) {
  try {
    const { serviceId, seatCode } = req.body;

    if (!serviceId || !seatCode) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const seat = await Seat.findOne({
      service: serviceId,
      code: seatCode,
      status: { $in: ['reserved', 'confirmed'] } // Solo se pueden liberar asientos reservados o confirmados
    });

    if (!seat) {
      return res.status(404).json({ message: 'Asiento no encontrado o no está reservado' });
    }

    await seat.releaseSeat();

    res.json({
      message: `Asiento ${seat.code} liberado exitosamente`,
      seat: {
        _id: seat._id,
        code: seat.code,
        service: seat.service,
        status: seat.status,
        isAvailable: seat.isAvailable
      }
    });

  } catch (err) {
    console.error('Error en releaseSeat:', err);
    res.status(500).json({ message: 'Error al liberar asiento', error: err.message });
  }
}

// OBTENER asientos de un servicio
async function getServiceSeats(req, res) {
  try {
    const { serviceId } = req.params;

    const seats = await Seat.find({ service: serviceId })
      .populate('passenger.user', 'name rut email')
      .populate('passenger.origin', 'name code')
      .populate('passenger.destination', 'name code')
      .select('-__v -createdAt -updatedAt');

    res.json({
      serviceId,
      count: seats.length,
      seats
    });

  } catch (err) {
    console.error('Error en getServiceSeats:', err);
    res.status(500).json({ message: 'Error al obtener asientos', error: err.message });
  }
}

module.exports = {
  reserveSeat,
  confirmSeat,
  releaseSeat,
  getServiceSeats
};