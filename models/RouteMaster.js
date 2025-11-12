const mongoose = require('mongoose');

const routeStopSchema = new mongoose.Schema({
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  order: { type: Number, required: true },
  offsetMinutes: Number, // tiempo acumulado desde inicio
  price: Number,
  isOrigin: { type: Boolean, default: false },
  isDestination: { type: Boolean, default: false }
}, { _id: false });

const routeMasterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  origin: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  startTime: { type: Number, required: true }, // Hora de inicio en minutos desde medianoche
  durationMinutes: { type: Number, required: true },
  direction: { type: String, enum: ['subida', 'bajada'], required: true },
  stops: [routeStopSchema], // Paradas intermedias en orden
  layout: { type: mongoose.Schema.Types.ObjectId, ref: 'BusLayout' },
  schedule: {
    active: { type: Boolean, default: true },
    daysOfWeek: { type: [Number], default: [1, 2, 3, 4, 5] },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    horizonDays: { type: Number, default: 14 },
    exceptions: [{
      date: { type: Date },
      type: { type: String, enum: ['available', 'unavailable'], default: 'unavailable' },
      reason: String
    }]
  },
  lastGeneratedDate: { type: Date, default: null }
}, { timestamps: true });

routeMasterSchema.pre('save', function (next) {
  // Asegurar que el primer stop es el origen y el último el destino
  if (this.stops.length > 0) {
    this.stops[0].isOrigin = true;
    this.stops[this.stops.length - 1].isDestination = true;
  }
  next();
});

routeMasterSchema.pre('remove', async function (next) {
  try {
    await Service.deleteMany({ routeMaster: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('RouteMaster', routeMasterSchema);