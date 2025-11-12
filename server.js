require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const testRoutes = require("./routes/testRoutes");
const startReleaseSeatsCron = require("./cron/releaseSeats");
const startGenerateServicesCron = require("./cron/generateServices");

const app = express();

// Rutas servicios
const routeAuth = require("./routes/authRoutes");
const routeBusLayout = require("./routes/busLayoutRoutes");
const routeMastersRoutes = require("./routes/routeMasters");
const routeSeat = require("./routes/seatRoutes");
const routeService = require("./routes/serviceRoutes");
const routeUsers = require("./routes/userRoutes");
const routeBus = require("./routes/busRoutes");

// Middlewares
app.use(cors());
app.use(express.json());
const authRole = require("./middlewares/authRole");
const dateRule = require("./middlewares/dateRule");


//sin autenticacion
app.use("/api/auth", routeAuth);
app.use("/api/test", testRoutes);

// con autenticacion
app.use("/api/bus-layout", authRole('superAdmin'), routeBusLayout);
app.use("/api/route-masters", authRole('superAdmin'), routeMastersRoutes);
app.use("/api/seats", authRole(), dateRule, routeSeat);
app.use("/api/services", authRole(), dateRule, routeService);
app.use("/api/buses", authRole(), dateRule, routeBus);
app.use("/api/users", authRole('superAdmin'), routeUsers);


// Configuración desde .env
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// Conexión a MongoDB (sin las opciones obsoletas)
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    startReleaseSeatsCron();
    // startGenerateServicesCron();
    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ Error en conexión MongoDB:", err));
