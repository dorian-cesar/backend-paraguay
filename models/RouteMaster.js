const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: String,
  offsetMinutes: Number,// tiempo acumulado desde inicio
  order: Number,
  price: Number
}, { _id: false });

const routeMasterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  startTime: { type: Number, required: true },
  durationMinutes: { type: Number, required: true },
  direction: { type: String, enum: ['subida', 'bajada'], required: true },
  stops: [stopSchema], // incluye origen y destino
  layout: { type: mongoose.Schema.Types.ObjectId, ref: 'BusLayout' },
  schedule: {
    active: { type: Boolean, default: true },
    daysOfWeek: { type: [Number], default: [1, 2, 3, 4, 5] }, // ISO: 1 = Lun ... 7 = Dom
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

routeMasterSchema.pre('remove', async function(next) {
  try {
    await Service.deleteMany({ routeMaster: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('RouteMaster', routeMasterSchema);