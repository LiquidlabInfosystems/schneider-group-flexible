const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const componentController = require("../controllers/parts");
const hubController = require("../controllers/hubs");
const spokeController = require("../controllers/spoke");
const ProjectController = require("../controllers/projects");
const sheetController = require("../controllers/sheetUpload");
const printerController = require("../controllers/printerController");
const multer = require('multer');
const verifyToken = require("../Middleware");
const fs = require('fs')
const path = require('path')

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + file.originalname);
    }
  });
  
  if (fs.existsSync('uploads')) {
    const files = fs.readdirSync("uploads");
    files.forEach((file) => {
      const currentPath = path.join("uploads", file);
      fs.unlinkSync(currentPath);
    });
  }
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync("uploads")
  }


// Create a multer instance with storage configuration
const upload = multer({ storage: storage });

// ADMIN ROUTES
router.post("/adminLogin", adminController.adminLogin);
router.post("/adminregister", adminController.adminSignUp);
// router.post("/createComponent", componentController.createComponent);

// MANAGE HUBS
router.post("/createHub", hubController.createHubs);
router.post("/deleteHub", verifyToken, hubController.deleteHub);
router.post("/updateHub", verifyToken, hubController.updateHub);
router.get("/getAllHubs", verifyToken, hubController.getAllHubs);

// MANAGE SPOKES
router.post("/createSpoke", verifyToken, spokeController.createSpoke);
router.post("/deleteSpoke", verifyToken, spokeController.deleteSpoke);
router.get("/getAllSpokes", verifyToken, spokeController.getAllSpokes);

// router.get("/getAllComponents", componentController.getAllComponents);
router.get("/getAllCommertialReferences", verifyToken, componentController.getAllCommertialReferences);

// MANAGE PARTS
router.post("/createPart", verifyToken, sheetController.createPart);
router.get("/getAllParts", verifyToken, componentController.getAllParts);

// PRINTER CONTROLS
router.get("/GETPrinter", verifyToken, printerController.GETPrinter);
router.post("/updatePrinter", verifyToken, printerController.updatePrinter);
router.post("/createPrinter", verifyToken, printerController.createPrinter);

// BOM CONTROLS
// router.post("/uploadCR", verifyToken, sheetController.uploadBomGoogleSheet);
router.post("/uploadCRFromAdmin", verifyToken, upload.single("file"), sheetController.uploadCRFromAdmin);
router.post("/uploadCRFromAdminPreview", verifyToken, upload.single("file"), sheetController.uploadCRFromAdminPreview);

// MANAGE CR
router.post("/createCR", verifyToken, sheetController.createCR);
router.post("/deleteCR", verifyToken, sheetController.deleteCR);
router.post("/recoverCR", verifyToken, sheetController.recoverCR);

// MANAGE PROJECTS
router.post("/getAllProjects", ProjectController.getAllProjects);

module.exports = router;
