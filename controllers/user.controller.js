const bcrypt = require("bcryptjs");
const User = require("../models/User");

// --- Utilidades ---
const sanitize = (doc) => {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    delete obj.password;
    return obj;
};

const ALLOWED_ROLES = new Set(["superAdmin", "usuario", "admin", "conductor", "auxiliar", "visita"]);
const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
const isBcryptHash = (s = "") => typeof s === "string" && /^\$2[aby]\$/.test(s);

exports.createUser = async (req, res) => {
    try {
        let { name, rut, email, password, role = "usuario", activo = true } = req.body || {};

        email = typeof email === "string" ? email.trim().toLowerCase() : email;
        rut = typeof rut === "string" ? rut.trim() : rut;

        if (!name || !email || !password || !role || !rut) {
            return res.status(400).json({ success: false, message: "Faltan campos requeridos (name, rut, email, password, role)." });
        }
        if (!isValidEmail(email)) return res.status(400).json({ success: false, message: "Email inválido." });
        if (isBcryptHash(password)) return res.status(400).json({ success: false, message: "Contraseña no debe venir hasheada." });
        if (!ALLOWED_ROLES.has(role)) return res.status(400).json({ success: false, message: "Rol inválido." });
        if (String(password).length < 8) return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 8 caracteres." });

        const user = new User({ name, rut, email, password, role, activo });
        await user.save();

        return res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente.",
            id: user._id
        });
    } catch (err) {
        console.error("createUser error:", err);

        if (err?.code === 11000) {
            const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || "campo único";
            return res.status(409).json({ success: false, message: `Ya existe un usuario con ese ${field}.` });
        }
        if (err?.name === "ValidationError") {
            return res.status(422).json({ success: false, message: "Error de validación.", details: err.errors });
        }
        return res.status(500).json({ success: false, message: "Error al crear usuario.", error: err.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
        const search = (req.query.search || "").trim();
        const role = (req.query.role || "").trim();
        const activo = req.query.activo === undefined ? undefined : req.query.activo === "true";

        const filter = {};
        if (search) {
            const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            filter.$or = [{ name: rx }, { email: rx }, { rut: rx }];
        }
        if (role) filter.role = role;
        if (activo !== undefined) filter.activo = activo;

        const [items, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select("-password"),
            User.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            items,
        });
    } catch (err) {
        console.error("getUsers error:", err);
        return res.status(500).json({ success: false, message: "Error al listar usuarios.", error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error("getUserById error:", err);
        if (err?.name === "CastError") {
            return res.status(400).json({ success: false, message: "ID inválido." });
        }
        return res.status(500).json({ success: false, message: "Error al obtener usuario.", error: err.message });
    }
};

exports.getCrewUsers = async (req, res) => {
    try {
        const crewUsers = await User.find({
            role: { $in: ["conductor", "auxiliar"] },
            activo: true,
        }).select("-password -createdAt -updatedAt -__v");

        return res.status(200).json({
            success: true,
            count: crewUsers.length,
            users: crewUsers,
        });
    } catch (err) {
        console.error("getCrewUsers error:", err);
        return res.status(500).json({ success: false, message: "Error al obtener tripulación.", error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const payload = req.body || {};
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado." });

        const updatable = ["name", "rut", "email", "password", "role", "activo"];
        for (const key of updatable) {
            if (payload[key] === undefined) continue;

            if (key === "email") {
                const newEmail = String(payload.email).trim().toLowerCase();
                if (!isValidEmail(newEmail)) return res.status(400).json({ success: false, message: "Email inválido." });
                user.email = newEmail;
                continue;
            }

            if (key === "password") {
                if (!payload.password) continue;
                if (isBcryptHash(payload.password)) return res.status(400).json({ success: false, message: "Contraseña no debe venir hasheada." });
                if (payload.password.length < 8) return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 8 caracteres." });
                user.password = payload.password; // pre('save') lo hashea
                continue;
            }

            if (key === "role") {
                if (!ALLOWED_ROLES.has(payload.role)) return res.status(400).json({ success: false, message: "Rol inválido." });
                user.role = payload.role;
                continue;
            }

            if (key === "rut") {
                const newRut = String(payload.rut).trim();
                if (!newRut) return res.status(400).json({ success: false, message: "RUT es requerido." });
                user.rut = newRut;
                continue;
            }

            user[key] = payload[key];
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Usuario actualizado correctamente.",
            id: user._id
        });
    } catch (err) {
        console.error("updateUser error:", err);

        if (err?.code === 11000) {
            const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || "campo único";
            return res.status(409).json({ success: false, message: `Ya existe un usuario con ese ${field}.` });
        }
        if (err?.name === "ValidationError") {
            return res.status(422).json({ success: false, message: "Error de validación.", details: err.errors });
        }
        if (err?.name === "CastError") {
            return res.status(400).json({ success: false, message: "ID inválido." });
        }
        return res.status(500).json({ success: false, message: "Error al actualizar usuario.", error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const target = await User.findById(id).select("-password");
        if (!target) return res.status(404).json({ success: false, message: "Usuario no encontrado." });

        if (target.role === "superAdmin") {
            const remaining = await User.countDocuments({ role: "superAdmin", _id: { $ne: id } });
            if (remaining === 0) {
                return res.status(400).json({ success: false, message: "No puedes eliminar al último superAdmin." });
            }
        }

        await target.deleteOne();
        return res.status(200).json({ success: true, message: "Usuario eliminado correctamente.", id: target._id });
    } catch (err) {
        console.error("deleteUser error:", err);
        if (err?.name === "CastError") {
            return res.status(400).json({ success: false, message: "ID inválido." });
        }
        return res.status(500).json({ success: false, message: "Error al eliminar usuario.", error: err.message });
    }
};

exports.toggleActivo = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado." });

        user.activo = !user.activo;
        await user.save();

        return res.status(200).json({
            success: true,
            message: user.activo ? "Usuario activado." : "Usuario desactivado.",
            id: user._id,
            activo: user.activo
        });
    } catch (err) {
        console.error("toggleActivo error:", err);
        if (err?.name === "CastError") {
            return res.status(400).json({ success: false, message: "ID inválido." });
        }
        return res.status(500).json({ success: false, message: "Error al actualizar estado.", error: err.message });
    }
};
