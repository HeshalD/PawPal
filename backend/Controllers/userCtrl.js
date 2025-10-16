const User = require("../Models/RegisterModel");
const mongoose = require("mongoose");

// ✅ Get all users
const getallUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json({ users }); // plural for list
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add a new user
const addUsers = async (req, res) => {
  const { Fname, Lname, email, password, confirmpassword, age } = req.body;

  try {
    // basic validations
    const required = ["Fname","Lname","email","password","confirmpassword"]; 
    for (const k of required) {
      if (!req.body[k]) return res.status(400).json({ message: `${k} is required` });
    }
    if (String(password) !== String(confirmpassword)) {
      return res.status(400).json({ message: "password and confirmpassword must match" });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase())) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const user = new User({ Fname, Lname, email, password, confirmpassword, age });
    await user.save();
    return res.status(201).json({ user }); // singular
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to add user" });
  }
};

// ✅ Get user by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user }); // singular
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update user
const updateUser = async (req, res) => {
  const { Fname, Lname, email, password, confirmpassword, age } = req.body;

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase())) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if ((password || confirmpassword) && String(password) !== String(confirmpassword)) {
      return res.status(400).json({ message: "password and confirmpassword must match" });
    }
    const user = await User.findByIdAndUpdate(
      id,
      { Fname, Lname, email, password, confirmpassword, age },
      { new: true } // return updated user
    );

    if (!user) {
      return res.status(404).json({ message: "Unable to update user" });
    }

    return res.status(200).json({ user }); // singular
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "Unable to delete user" });
    }

    return res.status(200).json({ message: "User deleted successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getallUsers = getallUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
