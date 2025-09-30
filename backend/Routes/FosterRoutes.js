const express = require("express");
const router = express.Router();
const { getAllFosters, getFosterById, addFoster, updateFoster, deleteFoster, updateFosterStatus } = require("../Controllers/FosterController");

// GET all foster requests
router.get("/", getAllFosters);

// GET foster by ID
router.get("/:id", getFosterById);

// POST a new foster request
router.post("/", addFoster);

// UPDATE a foster request
router.put("/:id", updateFoster);

// UPDATE only status of a foster request
router.patch("/:id/status", updateFosterStatus);

// DELETE a foster request
router.delete("/:id", deleteFoster);

module.exports = router;