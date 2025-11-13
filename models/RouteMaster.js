const mongoose = require('mongoose');

const routeStopSchema = new mongoose.Schema({
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  order: { type: Number, required: true },
  offsetMinutes: Number,
  price: Number,
  isOrigin: { type: Boolean, default: false },
  isDestination: { type: Boolean, default: false }
}, { _id: false });

const routeMasterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  origin: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  startTime: { type: Number, required: true },
  durationMinutes: { type: Number, required: true },
  stops: [routeStopSchema],
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
  if (this.stops.length > 0) {
    this.stops[0].isOrigin = true;
    this.stops[this.stops.length - 1].isDestination = true;
  }
  next();
});

module.exports = mongoose.model('RouteMaster', routeMasterSchema);