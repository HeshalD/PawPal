const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const petSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    breed: {
        type: String,
        required: true
    },
    healthStatus: {
        type: String,
        enum: ['Healthy', 'Normal', 'Weak'],
        default: 'Normal'
    },
    petId: {
        type: String,
        required: true,
        unique: true // unique ID for each pet
    }
});

module.exports = mongoose.model("PetModel", petSchema);
