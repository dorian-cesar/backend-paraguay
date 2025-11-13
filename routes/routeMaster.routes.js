const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/routeMaster.controller");

// CRUD Rutas Maestras
router.post("/", ctrl.createRouteMaster);
router.get("/", ctrl.getRouteMasters);
router.get("/origins", ctrl.getRouteOrigins);
router.get("/destinations", ctrl.getRouteDestinations);
router.get("/:id", ctrl.getRouteMasterById);
router.get("/:id/stops", ctrl.getRouteStops);
router.put("/:id", ctrl.updateRouteMaster);
router.delete("/:id", ctrl.deleteRouteMaster);

module.exports = router;
