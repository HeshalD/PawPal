const Pet = require("../Models/petModel");

//Get all pets
const getAllPets = async (req, res, next) => {
    let pets;
    try {
        pets = await Pet.find();
    } catch (err) {
        console.log(err);
    }
    if (!pets) {
        return res.status(404).json({ message: "No pets found" });
    }
    return res.status(200).json({ pets });
};

//Create pet profile
const addPet = async (req, res, next) => {
    const { name, age, breed } = req.body;

    let pet;
    try {
        // Auto-generate unique Pet ID
        const petId = "PET-" + Math.floor(Math.random() * 1000000);
        pet = new Pet({ name, age, breed, petId });
        await pet.save();
    } catch (err) {
        console.log(err);
    }

    if (!pet) {
        return res.status(500).json({ message: "Unable to add pet" });
    }
    return res.status(201).json({ pet });
};

//Get pet by ID
const getPetById = async (req, res, next) => {
    const id = req.params.id;
    let pet;
    try {
        pet = await Pet.findById(id);
    } catch (err) {
        console.log(err);
    }
    if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
    }
    return res.status(200).json({ pet });
};

//Update pet details
const updatePet = async (req, res, next) => {
    const id = req.params.id;
    const { name, age, breed } = req.body;

    let pet;
    try {
        pet = await Pet.findByIdAndUpdate(id, { name, age, breed }, { new: true });
    } catch (err) {
        console.log(err);
    }
    if (!pet) {
        return res.status(404).json({ message: "Unable to update pet" });
    }
    return res.status(200).json({ pet });
};

//Delete pet
const deletePet = async (req, res, next) => {
    const id = req.params.id;
    let pet;
    try {
        pet = await Pet.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }
    if (!pet) {
        return res.status(404).json({ message: "Unable to delete pet" });
    }
    return res.status(200).json({ message: "Pet deleted successfully" });
};

exports.getAllPets = getAllPets;
exports.addPet = addPet;
exports.getPetById = getPetById;
exports.updatePet = updatePet;
exports.deletePet = deletePet;
