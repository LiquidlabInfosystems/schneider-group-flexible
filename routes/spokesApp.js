const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware"); // Middleware for token verification
const ProjectController = require("../controllers/projects");
const SpokeController = require("../controllers/spoke");
const BoxSerialNoController = require("../controllers/box");
// Authentication
router.post("/spokelogin", SpokeController.LoginToSpoke);

// SPOKE RELATED REQUESTS
router.post("/getAllSpokeProjects", verifyToken, ProjectController.getAllSpokeProjects);
router.post("/getSpokeDetails", verifyToken, SpokeController.getSpokeDetails);
router.post("/getSpokeProjectsDetails", verifyToken, ProjectController.getSpokeProjectsDetails);
router.post("/getBoxDetails",verifyToken, BoxSerialNoController.getBoxDetails);
router.post("/getProjectDetailsWithParts",verifyToken, ProjectController.getProjectDetailsWithParts);

module.exports = router;
