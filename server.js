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
const routeCity = require("./routes/cityRoutes");

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
app.use("/api/cities", authRole(), routeCity);

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Conectado a DB");
    startReleaseSeatsCron();

    if (process.env.NODE_ENV === 'production') {
      startGenerateServicesCron();
    }

    app.listen(PORT, () => {
      process.env.NODE_ENV === 'production'
        ? console.log(`Servidor en puerto: ${PORT}`)
        : console.log(`Servidor en desarrollo en http://localhost:${PORT}`)
    });
  })
  .catch(err => console.error("Error en conexión a DB:", err));
