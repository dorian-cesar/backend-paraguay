const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    region: { type: String, trim: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('City', citySchema);