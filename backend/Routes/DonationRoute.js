const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const DonationController = require("../Controllers/DonationController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Basic CRUD routes
router.get("/", DonationController.getAllDonations);
router.post("/", DonationController.createDonation);
router.post("/add", DonationController.addDonations);
router.get("/:id", DonationController.getById);
router.put("/:id", DonationController.updateDonation);
router.delete("/:id", DonationController.deleteDonation);

// New routes for donation management
router.post("/:id/upload-slip", upload.single('slip'), DonationController.uploadSlip);
router.put("/:id/complete", DonationController.markAsCompleted);
router.get("/status/:status", DonationController.getDonationsByStatus);
router.get("/manager/pending", DonationController.getPendingDonations);
router.get("/manager/completed", DonationController.getCompletedDonations);

// Filtering and summary routes
router.get("/filter/data", DonationController.getDonationsWithFilter);
router.get("/summary/stats", DonationController.getDonationSummary);

module.exports = router;