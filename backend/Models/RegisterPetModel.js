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
    petId: {
        type: String,
        required: true,
        unique: true // unique ID for each pet
    }
});

module.exports = mongoose.model("RegisterPetModel", petSchema);
