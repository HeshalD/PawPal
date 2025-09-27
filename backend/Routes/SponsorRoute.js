const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const SponsorController = require("../Controllers/SponsorController");

const adsDir = path.join(__dirname, "..", "uploads", "sponsor_ads");
if (!fs.existsSync(adsDir)) {
  fs.mkdirSync(adsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, adsDir);
  },
  filename: function (req, file, cb) {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, Date.now() + "-" + safeOriginal);
  },
});

const upload = multer({ storage });

router.get("/", SponsorController.getAllSponsors);
router.get("/:id", SponsorController.getSponsorById);
router.post("/", upload.single("adImage"), SponsorController.createSponsor);
router.put("/:id", upload.single("adImage"), SponsorController.updateSponsor);
router.delete("/:id", SponsorController.deleteSponsor);

router.put("/:id/approve", SponsorController.approveSponsor);
router.put("/:id/reject", SponsorController.rejectSponsor);
router.put("/:id/soft-delete", SponsorController.softDeleteSponsor);
router.post("/:id/upload-ad", upload.single("adImage"), SponsorController.uploadAd);

router.get("/status/:status", SponsorController.getSponsorsByStatus);
router.get("/manager/pending", SponsorController.getManagerPending);
router.get("/manager/active", SponsorController.getManagerActive);
router.get("/manager/past", SponsorController.getManagerPast);
router.get("/homepage/active-ads", SponsorController.getHomepageActiveAds);

// New filtering and summary routes
router.get("/filter/data", SponsorController.getSponsorsWithFilter);
router.get("/summary/stats", SponsorController.getSponsorSummary);

module.exports = router;

