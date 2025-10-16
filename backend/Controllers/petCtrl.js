const Pet = require("../Models/petModel");

//Get all pets
const getAllPets = async (req, res, next) => {
    let pets;
    try {
        const { ownerEmail } = req.query || {};
        const filter = ownerEmail ? { ownerEmail } : {};
        pets = await Pet.find(filter);
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
    const { name, age, breed, healthStatus, ownerEmail } = req.body;

    let pet;
    try {
        // If a user email is provided, enforce max 5 pets per user
        if (ownerEmail) {
            const count = await Pet.countDocuments({ ownerEmail });
            if (count >= 5) {
                return res.status(400).json({ message: "You have reached the maximum number of pets (5)." });
            }
        }

        // Auto-generate unique Pet ID
        const petId = "PET-" + Math.floor(Math.random() * 1000000);
        pet = new Pet({ name, age, breed, petId, healthStatus, ownerEmail });
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
    const { name, age, breed, healthStatus } = req.body;

    let pet;
    try {
        const update = {};
        if (name !== undefined) update.name = name;
        if (age !== undefined) update.age = age;
        if (breed !== undefined) update.breed = breed;
        if (healthStatus !== undefined) update.healthStatus = healthStatus;
        pet = await Pet.findByIdAndUpdate(id, update, { new: true });
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
