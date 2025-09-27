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

// Virtual field for status based on stock levels
InventorySchema.virtual('status').get(function() {
  const stock = this.Quantity || 0;
  if (stock === 0) {
    return {
      label: "Out of Stock",
      color: "bg-red-100 text-red-700",
      value: "out_of_stock"
    };
  } else if (stock < 5) {
    return {
      label: "Low Stock",
      color: "bg-yellow-100 text-yellow-700", 
      value: "low_stock"
    };
  } else {
    return {
      label: "Active",
      color: "bg-green-100 text-green-700",
      value: "active"
    };
  }
});

// Ensure virtual fields are included when converting to JSON
InventorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Inventory", InventorySchema);
