const City = require("../models/City");

exports.createCity = async (req, res) => {
    try {
        if (req.body.name && typeof req.body.name === "string") req.body.name = req.body.name.trim();
        if (req.body.code && typeof req.body.code === "string") req.body.code = req.body.code.trim();

        const city = new City(req.body);
        await city.save();

        return res.status(200).json({
            success: true,
            message: "Ciudad creada correctamente.",
            id: city._id
        });
    } catch (err) {
        if (err?.code === 11000) {
            const field = Object.keys(err.keyValue || {})[0] || "campo único";
            return res.status(409).json({
                success: false,
                message: `Ya existe una ciudad con ese ${field}.`
            });
        }

        if (err?.name === "ValidationError") {
            return res.status(422).json({
                success: false,
                message: "Error de validación al crear la ciudad.",
                details: err.errors
            });
        }

        return res.status(400).json({
            success: false,
            message: "Error al crear la ciudad.",
            error: err.message
        });
    }
};

exports.getCities = async (req, res) => {
    try {
        const cities = await City.find({ active: true }).sort({ name: 1 });
        return res.status(200).json({ success: true, data: cities });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener las ciudades.",
            error: err.message
        });
    }
};

exports.getCityById = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);
        if (!city) {
            return res.status(404).json({ success: false, message: "Ciudad no encontrada." });
        }
        return res.status(200).json({ success: true, data: city });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener la ciudad.",
            error: err.message
        });
    }
};

exports.updateCity = async (req, res) => {
    try {
        if (req.body.name && typeof req.body.name === "string") req.body.name = req.body.name.trim();
        if (req.body.code && typeof req.body.code === "string") req.body.code = req.body.code.trim();

        const city = await City.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!city) {
            return res.status(404).json({ success: false, message: "Ciudad no encontrada." });
        }

        return res.status(200).json({
            success: true,
            message: "Ciudad actualizada correctamente.",
            id: city._id
        });
    } catch (err) {
        if (err?.code === 11000) {
            const field = Object.keys(err.keyValue || {})[0] || "campo único";
            return res.status(409).json({
                success: false,
                message: `Actualización fallida: ya existe otra ciudad con ese ${field}.`
            });
        }

        if (err?.name === "ValidationError") {
            return res.status(422).json({
                success: false,
                message: "Error de validación al actualizar la ciudad.",
                details: err.errors
            });
        }

        return res.status(400).json({
            success: false,
            message: "Error al actualizar la ciudad.",
            error: err.message
        });
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
            return res.status(404).json({ success: false, message: "Ciudad no encontrada." });
        }

        return res.status(200).json({ success: true, message: "Ciudad desactivada correctamente." });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al desactivar la ciudad.",
            error: err.message
        });
    }
};
