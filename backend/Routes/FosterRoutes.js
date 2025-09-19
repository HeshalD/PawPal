const express = require("express");
const router = express.Router();
const { getAllFosters, addFoster, updateFoster, deleteFoster } = require("../Controllers/FosterController");

// GET all foster requests
router.get("/", getAllFosters);

// POST a new foster request
router.post("/", addFoster);

// UPDATE a foster request
router.put("/:id", updateFoster);

// DELETE a foster request
router.delete("/:id", deleteFoster);

module.exports = router;