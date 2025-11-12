const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const { validDate } = require("../utils/fechaChile");

// --- Utilidades ---
const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

// --- Login ---
exports.loginEmail = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validaciones básicas
        if (!email || !password) {
            return res.status(400).json({
                message: "Email y contraseña son requeridos."
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Formato de email inválido."
            });
        }

        // Buscar usuario por email (case insensitive)
        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        // Verificar si el usuario existe y está activo
        if (!user) {
            return res.status(401).json({
                message: "Credenciales inválidas."
            });
        }

        if (!user.activo) {
            return res.status(401).json({
                message: "Usuario desactivado. Contacta al administrador."
            });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Credenciales inválidas."
            });
        }

        // const role = String(user.role || '').trim().toLowerCase();
        // if (role === "contratista" && !validDate()) {
        //     return res.status(403).json({
        //         message: "Acceso denegado: si eres contratista no puedes acceder antes del día 21 del mes."
        //     })
        // }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Responder con token y datos del usuario (sin password)
        res.json({
            message: "Login exitoso",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                rut: user.rut,
                role: user.role,
                activo: user.activo,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({
            message: "Error interno del servidor durante el login."
        });
    }
};

exports.loginRut = async (req, res) => {
    try {
        const { rut, password } = req.body;

        // Validaciones básicas
        if (!rut || !password) {
            return res.status(400).json({
                message: "Rut y contraseña son requeridos."
            });
        }

        // Buscar usuario por email (case insensitive)
        const user = await User.findOne({
            rut: rut.toLowerCase().trim()
        });

        // Verificar si el usuario existe y está activo
        if (!user) {
            return res.status(401).json({
                message: "Credenciales inválidas."
            });
        }

        if (!user.activo) {
            return res.status(401).json({
                message: "Usuario desactivado. Contacta al administrador."
            });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Credenciales inválidas."
            });
        }

        // const role = String(user.role || '').trim().toLowerCase();
        // if (role === "contratista" && !validDate()) {
        //     return res.status(403).json({
        //         message: "Acceso denegado: si eres contratista no puedes acceder antes del día 21 del mes."
        //     })
        // }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Responder con token y datos del usuario (sin password)
        res.json({
            message: "Login exitoso",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                rut: user.rut,
                role: user.role,
                activo: user.activo,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({
            message: "Error interno del servidor durante el login."
        });
    }
};

