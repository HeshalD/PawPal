const express = require("express");
const router = express.Router();

//insert model
const user = require("../Models/userModel");
//insert User controller
const usercontroller = require("../Controllers/userCtrl");


router.get("/",usercontroller.getallUsers);
router.post("/",usercontroller.addUsers);
router.get("/:id",usercontroller.getById);
router.put("/:id",usercontroller.updateUser);
router.delete("/:id",usercontroller.deleteUser);

//export
module.exports = router; 