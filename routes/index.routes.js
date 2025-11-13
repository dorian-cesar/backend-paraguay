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
const authMiddleware = require("../middlewares/auth.middleware");

router.use("/auth", auth); //middleware dentro de su propia ruta
router.use("/bus-layout", authMiddleware({ allowedRoles: ['superAdmin', 'admin'] }), busLayout);
router.use("/route-masters", authMiddleware({ allowedRoles: ['superAdmin', 'admin'] }), routeMaster);
router.use("/seats", seat); //middleware dentro de su propia ruta
router.use("/services", service); //middleware dentro de su propia ruta
router.use("/buses", authMiddleware({ allowedRoles: ['superAdmin', 'admin'] }), bus);
router.use("/users", authMiddleware({ allowedRoles: ['superAdmin', 'admin'] }), user);
router.use("/cities", authMiddleware({ allowedRoles: ['superAdmin', 'admin'] }), city);

module.exports = router;