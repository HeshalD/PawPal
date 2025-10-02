const express = require("express");
const router = express.Router();
//Insert Model
const Adoption = require("../Models/AdoptionModel");
//Insert User Conroller
const AdoptionController = require("../Controllers/AdoptionController");

router.get("/",AdoptionController.getAllAdoptions);
router.post("/add",AdoptionController.upload.single('salarySheet'),AdoptionController.addAdoptions);
router.get("/email/:email",AdoptionController.getAdoptionByEmail);
router.get("/:id",AdoptionController.getById);
router.put("/:id",AdoptionController.UpdateAdoptions);
router.put("/status/:id",AdoptionController.updateAdoptionStatus);
router.delete("/:id",AdoptionController.DeleteAdoptions);

//export
module.exports = router;