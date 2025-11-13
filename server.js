require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const testRoutes = require("./routes/testRoutes");
const startReleaseSeatsCron = require("./cron/releaseSeats");
const startGenerateServicesCron = require("./cron/generateServices");

const app = express();

// Rutas servicios
const routeAuth = require("./routes/auth.routes");
const routeBusLayout = require("./routes/busLayout.routes");
const routeMastersRoutes = require("./routes/routeMasters");
const routeSeat = require("./routes/seatRoutes");
const routeService = require("./routes/serviceRoutes");
const routeUsers = require("./routes/userRoutes");
const routeBus = require("./routes/bus.routes");
const routeCity = require("./routes/city.routes");

// Middlewares
app.use(cors());
app.use(express.json());
const authRole = require("./middlewares/authRole");
const dateRule = require("./middlewares/dateRule");


//sin autenticacion
app.use("/api/auth", routeAuth);
app.use("/api/test", testRoutes);

// con autenticacion
app.use("/api/bus-layout", authRole('superAdmin', 'admin'), routeBusLayout);
app.use("/api/route-masters", authRole('superAdmin', 'admin'), routeMastersRoutes);
app.use("/api/seats", authRole(), routeSeat);
app.use("/api/services", authRole(), routeService);
app.use("/api/buses", authRole(), routeBus);
app.use("/api/users", authRole('superAdmin', 'admin'), routeUsers);
app.use("/api/cities", authRole('superAdmin', 'admin'), routeCity);

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
