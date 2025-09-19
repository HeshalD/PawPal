const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InventorySchema = new Schema({
  Item_Name: {
    type: String,
    required: true,
  },
  Category: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  Unit_of_Measure: {
    type: String,
    required: true,
  },
  Quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  Price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: false
  },
});

module.exports = mongoose.model("Inventory", InventorySchema);
