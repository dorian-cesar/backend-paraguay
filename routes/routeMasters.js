const express = require("express");
const router = express.Router();
const routeMasterController = require("../controllers/routeMasterController");

// CRUD Rutas Maestras
router.post("/", routeMasterController.createRouteMaster);
router.get("/", routeMasterController.getRouteMasters);
router.get("/origins", routeMasterController.getOriginsByDirection);
router.get("/destinations", routeMasterController.getDestinationsByDirection);
router.get("/:id", routeMasterController.getRouteMasterById);
router.put("/:id", routeMasterController.updateRouteMaster);
router.delete("/:id", routeMasterController.deleteRouteMaster);

module.exports = router;
