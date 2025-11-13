const express = require("express");
const router = express.Router();
const routeMasterController = require("../controllers/routeMasterController");

// CRUD Rutas Maestras
router.post("/", routeMasterController.createRouteMaster);
router.get("/", routeMasterController.getRouteMasters);
router.get("/origins", routeMasterController.getRouteOrigins);
router.get("/destinations", routeMasterController.getRouteDestinations);
router.get("/:id", routeMasterController.getRouteMasterById);
router.get("/:id/stops", routeMasterController.getRouteStops);
router.put("/:id", routeMasterController.updateRouteMaster);
router.delete("/:id", routeMasterController.deleteRouteMaster);

module.exports = router;
