const express = require("express");
const router = express.Router();

//insert Pet controller
const petController = require("../Controllers/petCtrl");

router.get("/", petController.getAllPets);       // View all pets
router.post("/", petController.addPet);          // Add new pet
router.get("/:id", petController.getPetById);    // View single pet
router.put("/:id", petController.updatePet);     // Update pet
router.delete("/:id", petController.deletePet);  // Delete pet

module.exports = router;
