const User = require("../Models/userModel");

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
    const user = await User.findById(req.params.id);
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
    const user = await User.findByIdAndUpdate(
      req.params.id,
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
    const user = await User.findByIdAndDelete(req.params.id);

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
