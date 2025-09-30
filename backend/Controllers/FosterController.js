const Foster = require("../Model/FosterModel");

// Get all foster requests
const getAllFosters = async (req, res) => {
  try {
    const fosters = await Foster.find();
    res.status(200).json({ fosters });
  } catch (err) {
    res.status(500).json({ message: "Error fetching fosters", error: err.message });
  }
};

// Get a single foster request by ID
const getFosterById = async (req, res) => {
  try {
    const { id } = req.params;
    const foster = await Foster.findById(id);
    if (!foster) {
      return res.status(404).json({ message: "Foster request not found" });
    }
    res.status(200).json({ foster });
  } catch (err) {
    res.status(400).json({ message: "Error fetching foster", error: err.message });
  }
};

// Add a foster request
const addFoster = async (req, res) => {
  try {
    const payload = { ...req.body, status: "pending" };
    const foster = new Foster(payload);
    await foster.save();
    res.status(201).json({ foster });
  } catch (err) {
    res.status(400).json({ message: "Error adding foster", error: err.message });
  }
};

// Update a foster request
const updateFoster = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Foster.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ message: "Foster request not found" });
    }
    res.status(200).json({ foster: updated });
  } catch (err) {
    res.status(400).json({ message: "Error updating foster", error: err.message });
  }
};

// Delete a foster request
const deleteFoster = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Foster.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Foster request not found" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: "Error deleting foster", error: err.message });
  }
};

// Update only status of a foster request
const updateFosterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["pending", "approved", "completed"];
    const next = String(status || "").toLowerCase();
    if (!allowed.includes(next)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const updated = await Foster.findByIdAndUpdate(
      id,
      { status: next },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Foster request not found" });
    }
  } catch (err) {
    res.status(400).json({ message: "Error updating foster status", error: err.message });
  }
};

module.exports = { getAllFosters, getFosterById, addFoster, updateFoster, deleteFoster, updateFosterStatus };