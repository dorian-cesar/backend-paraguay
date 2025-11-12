const City = require("../models/City");

exports.createCity = async (req, res) => {
    try {
        const city = new City(req.body);
        await city.save();
        res.status(201).json(city);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getCities = async (req, res) => {
    try {
        const cities = await City.find({ active: true }).sort({ name: 1 });
        res.json(cities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCityById = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);
        if (!city) {
            return res.status(404).json({ message: "Ciudad no encontrada" });
        }
        res.json(city);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCity = async (req, res) => {
    try {
        const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!city) {
            return res.status(404).json({ message: "Ciudad no encontrada" });
        }
        res.json(city);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteCity = async (req, res) => {
    try {
        const city = await City.findByIdAndUpdate(
            req.params.id,
            { active: false },
            { new: true }
        );
        if (!city) {
            return res.status(404).json({ message: "Ciudad no encontrada" });
        }
        res.json({ message: "Ciudad desactivada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};