const express = require("express");
const router = express.Router();
//Insert Model
const Adoption = require("../Model/AdoptionModel");
//Insert User Conroller
const AdoptionController = require("../Controlers/AdoptionController");

router.get("/",AdoptionController.getAllAdoptions);
router.post("/",AdoptionController.addAdoptions);
router.get("/:id",AdoptionController.getById);
router.put("/:id",AdoptionController.UpdateAdoptions);
router.delete("/:id",AdoptionController.DeleteAdoptions);

//export
module.exports = router;