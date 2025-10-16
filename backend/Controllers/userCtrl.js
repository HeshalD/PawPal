const User = require("../Models/RegisterModel");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
  const { Fname, Lname, email, age, currentPassword, newPassword, confirmNewPassword } = req.body;

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase())) {
      return res.status(400).json({ message: "Invalid email" });
    }
    // Build update data without password fields by default
    const updateData = { Fname, Lname, email, age };

    // Handle password change only if currentPassword + newPassword are provided
    if (currentPassword != null || newPassword != null || confirmNewPassword != null) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ message: "To change password, provide currentPassword, newPassword and confirmNewPassword" });
      }
      if (String(newPassword) !== String(confirmNewPassword)) {
        return res.status(400).json({ message: "New passwords do not match" });
      }
      // Load user to verify current password
      const existing = await User.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "User not found" });
      }
      const stored = existing.password || "";
      let isValid = false;
      if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
        isValid = await bcrypt.compare(String(currentPassword), stored);
      } else {
        isValid = (String(currentPassword) === String(stored));
      }
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      // Hash and set new password
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(String(newPassword), salt);
      updateData.password = hashed;
      updateData.confirmpassword = hashed;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
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
