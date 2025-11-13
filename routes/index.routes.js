const express = require('express');
const router = express.Router();

//rutas
const auth = require("./auth.routes");
const busLayout = require("./busLayout.routes");
const routeMaster = require("./routeMaster.routes");
const seat = require("./seat.routes");
const service = require("./service.routes");
const user = require("./user.routes");
const bus = require("./bus.routes");
const city = require("./city.routes");

//middleware
const authRole = require("../middlewares/authRole");

//no auth
router.use("/auth", auth);

//auth
router.use("/bus-layout", authRole('superAdmin', 'admin'), busLayout);
router.use("/route-masters", authRole('superAdmin', 'admin'), routeMaster);
router.use("/seats", authRole(), seat);
router.use("/services", authRole(), service);
router.use("/buses", authRole(), bus);
router.use("/users", authRole('superAdmin', 'admin'), user);
router.use("/cities", authRole('superAdmin', 'admin'), city);

module.exports = router;