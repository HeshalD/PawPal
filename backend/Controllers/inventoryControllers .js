const Inventory = require("../Models/inventoryModel");
const mongoose = require("mongoose");

// Get all items
const getAllItem = async (req, res, next) => {
  try {
    const items = await Inventory.find();
    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch items" });
  }
};

// Insert data
const addItem = async (req, res, next) => {
  const { Item_Name, Category, Description, Unit_of_Measure, Quantity, Price } = req.body;
  let imagePath = '';
  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
  }
  try {
    // basic required checks
    const required = ["Item_Name","Category","Unit_of_Measure","Quantity","Price"];
    for (const k of required) {
      if (req.body[k] === undefined || req.body[k] === null || req.body[k] === "") {
        return res.status(400).json({ message: `${k} is required` });
      }
    }
    if (isNaN(Number(Quantity)) || Number(Quantity) < 0) {
      return res.status(400).json({ message: "Quantity must be a non-negative number" });
    }
    if (isNaN(Number(Price)) || Number(Price) < 0) {
      return res.status(400).json({ message: "Price must be a non-negative number" });
    }
    const item = await Inventory.create({ Item_Name, Category, Description, Unit_of_Measure, Quantity, Price, image: imagePath });
    return res.status(201).json({ item });
  } catch (error) {
    return res.status(400).json({ message: "Unable to add item" });
  }
};

// Get by ID
const getById = async (req, res, next) => {
  const id = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json({ item });
  } catch (error) {
    return res.status(400).json({ message: "Invalid ID" });
  }
};

// Update item details
const updateItem = async (req, res, next) => {
  const id = req.params.id;
  const { Item_Name, Category, Description, Unit_of_Measure, Quantity, Price } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const item = await Inventory.findByIdAndUpdate(
      id,
      { Item_Name, Category, Description, Unit_of_Measure, Quantity, Price },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json({ item });
  } catch (error) {
    return res.status(400).json({ message: "Unable to update item" });
  }
};

// Delete item
const deleteItem = async (req, res, next) => {
  const id = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const item = await Inventory.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json({ item });
  } catch (error) {
    return res.status(400).json({ message: "Unable to delete item" });
  }
};

exports.getAllItem = getAllItem;
exports.addItem = addItem;
exports.getById = getById;
exports.updateItem = updateItem;
exports.deleteItem = deleteItem;


