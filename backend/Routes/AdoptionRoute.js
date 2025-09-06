const express = require("express");
const router = express.Router();
//Insert Model
const Adoption = require("../Model/AdoptionModel");
//Insert User Conroller
const AdoptionController = require("../Controllers/AdoptionController");

router.get("/",AdoptionController.getAllAdoptions);
router.post("/add",AdoptionController.addAdoptions);
router.get("/:id",AdoptionController.getById);
router.put("/:id",AdoptionController.UpdateAdoptions);
router.delete("/:id",AdoptionController.DeleteAdoptions);

//export
module.exports = router;