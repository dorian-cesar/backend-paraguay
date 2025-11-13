const mongoose = require('mongoose');

const departureSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  stop: { type: String, required: true },
  time: { type: Date, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const crewMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['conductor', 'auxiliar'], required: true }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 }
}, { _id: true });

const farSchema = new mongoose.Schema({
  folio: { type: String, required: true },
  amount: { type: Number, required: true },
  deliveredTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deliveredAt: { type: Date, default: Date.now },
  renderedAt: { type: Date, default: null },
  expenses: { type: [expenseSchema], default: [] },
  status: { type: String, enum: ['pendiente', 'rendido', 'cerrado'], default: 'pendiente' }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  routeMaster: { type: mongoose.Schema.Types.ObjectId, ref: 'RouteMaster', required: true },
  date: { type: Date, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null },
  layout: { type: mongoose.Schema.Types.ObjectId, ref: 'BusLayout', required: true },
  seats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat' }],
  crew: { type: [crewMemberSchema], default: [] },
  far: { type: farSchema, default: null },
  departures: { type: [departureSchema], default: [] }
}, { timestamps: true });

serviceSchema.index({ 'far.folio': 1 }, { unique: true, sparse: true });

serviceSchema.pre('validate', function (next) {
  if (this.far && this.far.deliveredTo) {
    const deliveredId = String(this.far.deliveredTo);
    const existsInCrew = (this.crew || []).some(c => String(c.user) === deliveredId);
    if (!existsInCrew) {
      return next(new Error('far.deliveredTo debe ser un user perteneciente al crew del servicio'));
    }
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);