const Pet = require("../Models/petModel");
const mongoose = require("mongoose");

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

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").toLowerCase());
};

const isValidHealthStatus = (status) => {
    return ["Healthy", "Normal", "Weak"].includes(status);
};

const validateCreatePayload = (body) => {
    const errors = [];
    const name = typeof body.name === "string" ? body.name.trim() : body.name;
    const breed = typeof body.breed === "string" ? body.breed.trim() : body.breed;
    const ageNum = Number(body.age);

    if (!name) errors.push("name is required");
    if (Number.isNaN(ageNum)) errors.push("age must be a number");
    if (breed === undefined || breed === null || breed === "") errors.push("breed is required");

    if (body.healthStatus !== undefined && !isValidHealthStatus(body.healthStatus)) {
        errors.push("healthStatus must be one of Healthy, Normal, Weak");
    }

    if (body.ownerEmail !== undefined && body.ownerEmail !== null && body.ownerEmail !== "") {
        if (!isValidEmail(body.ownerEmail)) errors.push("ownerEmail must be a valid email");
    }

    return { errors, sanitized: { name, breed, age: ageNum } };
};

const validateUpdatePayload = (body) => {
    const errors = [];
    const update = {};

    if (body.name !== undefined) {
        if (typeof body.name !== "string" || body.name.trim() === "") errors.push("name must be a non-empty string");
        else update.name = body.name.trim();
    }
    if (body.age !== undefined) {
        const ageNum = Number(body.age);
        if (Number.isNaN(ageNum)) errors.push("age must be a number");
        else update.age = ageNum;
    }
    if (body.breed !== undefined) {
        if (typeof body.breed !== "string" || body.breed.trim() === "") errors.push("breed must be a non-empty string");
        else update.breed = body.breed.trim();
    }
    if (body.healthStatus !== undefined) {
        if (!isValidHealthStatus(body.healthStatus)) errors.push("healthStatus must be one of Healthy, Normal, Weak");
        else update.healthStatus = body.healthStatus;
    }

    return { errors, update };
};

//Create pet profile
const addPet = async (req, res, next) => {
    const { errors, sanitized } = validateCreatePayload(req.body);
    if (errors.length) {
        return res.status(400).json({ message: errors.join(", ") });
    }

    const { name, age, breed } = sanitized;
    const { healthStatus, ownerEmail } = req.body;

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
        const payload = { name, age, breed, petId };
        if (healthStatus !== undefined) payload.healthStatus = healthStatus;
        if (ownerEmail !== undefined) payload.ownerEmail = ownerEmail;
        pet = new Pet(payload);
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid id" });
    }
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid id" });
    }

    const { errors, update } = validateUpdatePayload(req.body);
    if (errors.length) {
        return res.status(400).json({ message: errors.join(", ") });
    }

    let pet;
    try {
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid id" });
    }
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
