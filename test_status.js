// Test script to verify status logic
const mongoose = require('mongoose');

// Define the schema locally for testing
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

const Inventory = mongoose.model("Inventory", InventorySchema);

// Test cases
const testCases = [
  { Quantity: 0, expected: "Out of Stock" },
  { Quantity: 1, expected: "Low Stock" },
  { Quantity: 4, expected: "Low Stock" },
  { Quantity: 5, expected: "Active" },
  { Quantity: 10, expected: "Active" },
  { Quantity: 100, expected: "Active" }
];

console.log("Testing Status Logic:");
console.log("===================");

testCases.forEach((testCase, index) => {
  const item = new Inventory({
    Item_Name: `Test Item ${index + 1}`,
    Category: "Test",
    Description: "Test Description",
    Unit_of_Measure: "pcs",
    Quantity: testCase.Quantity,
    Price: 10.00
  });
  
  const status = item.status;
  const passed = status.label === testCase.expected;
  
  console.log(`Test ${index + 1}: Stock=${testCase.Quantity} -> Status="${status.label}" (Expected: "${testCase.expected}") ${passed ? '✅' : '❌'}`);
  console.log(`   Color: ${status.color}`);
  console.log(`   Value: ${status.value}`);
  console.log("");
});

console.log("JSON Serialization Test:");
console.log("=======================");

const testItem = new Inventory({
  Item_Name: "Test Item",
  Category: "Test",
  Description: "Test Description", 
  Unit_of_Measure: "pcs",
  Quantity: 3,
  Price: 10.00
});

const jsonOutput = JSON.stringify(testItem, null, 2);
console.log("JSON output includes status field:");
console.log(jsonOutput.includes('"status"') ? '✅ Status field included' : '❌ Status field missing');
