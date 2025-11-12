const Seat = require('../models/Seat');
const User = require('../models/User');
const Service = require('../models/Service');


async function reserveSeat(req, res) {
  try {
    const { serviceId, seatCode, rut, origin, destination } = req.body;

    if (!serviceId || !seatCode || !rut || !origin || !destination) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    // Validar usuario
    const user = await User.findOne({ rut });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado.' });

    let originStopName;
    let destStopName;

    if (service.direction === 'subida') {
      originStopName = origin
      destStopName = service.destination;
    } else {
      originStopName = service.origin;
      destStopName = destination;
    }

    // Reserva atómica
    const now = new Date();
    const holdUntil = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutos
    const seat = await Seat.findOneAndUpdate(
      { service: serviceId, code: seatCode, isAvailable: true, $or: [{ holdUntil: null }, { holdUntil: { $lte: now } }] },
      {
        isAvailable: false,
        holdUntil,
        passenger:
        {
          user: user._id,
          origin: originStopName,
          destination: destStopName
        }
      },
      { new: true }
    ).populate('passenger.user', 'name rut');

    if (!seat) return res.status(400).json({ message: 'Asiento no disponible' });

    res.status(201).json({
      message: `Asiento ${seat.code} reservado temporalmente desde ${originStopName} hasta ${destStopName}`,
      seat
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al reservar asiento' });
  }
}


// CONFIRMAR asiento (ocupado hasta destino)
async function confirmSeat(req, res) {
  try {
    const { serviceId, seatCode } = req.body;
    if (!serviceId || !seatCode) return res.status(400).json({ message: 'Faltan datos obligatorios' });

    const seat = await Seat.findOne({ service: serviceId, code: seatCode });
    if (!seat) return res.status(404).json({ message: 'Asiento no encontrado' });

    // Confirmar asiento
    seat.holdUntil = null;  // eliminar expiración de hold
    seat.isAvailable = false; // asegurar que sigue ocupado

    await seat.save();
    res.json({ message: `Asiento ${seat.code} confirmado`, seat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al confirmar asiento' });
  }
}

// LIBERAR asiento (volver a disponible)
async function releaseSeat(req, res) {
  try {
    const { serviceId, seatCode } = req.body;
    if (!serviceId || !seatCode) return res.status(400).json({ message: 'Faltan datos obligatorios' });

    const seat = await Seat.findOne({ service: serviceId, code: seatCode });
    if (!seat) return res.status(404).json({ message: 'Asiento no encontrado' });

    seat.isAvailable = true;
    seat.holdUntil = null;
    seat.passenger = null;

    await seat.save();
    res.json({ message: `Asiento ${seat.code} liberado`, seat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al liberar asiento' });
  }
}

module.exports = { reserveSeat, confirmSeat, releaseSeat };

