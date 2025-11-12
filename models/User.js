const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    rut: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["superAdmin", "usuario", "admin", "conductor", "auxiliar"], required: true },
    activo: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password si cambió y vino en texto plano
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    if (/^\$2[aby]\$/.test(this.password)) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model("User", userSchema);
