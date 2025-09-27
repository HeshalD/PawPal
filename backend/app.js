
//password - lJv2dSasOC6LPFG1
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require('dotenv').config();

// Route imports
const userRouter = require("./Routes/userRoute");
const petRouter = require("./Routes/petRoute");
const AdoptionRoute = require("./Routes/AdoptionRoute");
const fosterRoutes = require("./Routes/FosterRoutes");
const sponsorRoutes = require("./Routes/SponsorRoute");
const Sponsor = require("./Models/SponsorModel");
const donationRoutes = require("./Routes/DonationRoute");

const app = express();

// Middleware
app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && /^http:\/\/localhost:\d+$/.test(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/users", userRouter);
app.use("/pets", petRouter);
app.use("/adoptions", AdoptionRoute);
app.use("/fosters", fosterRoutes);
app.use("/sponsors", sponsorRoutes);
app.use("/donations", donationRoutes);

// MongoDB connection
mongoose.connect("mongodb+srv://Duleepa:lJv2dSasOC6LPFG1@cluster0.o9fdduy.mongodb.net/pawpalDB")
  .then(() => console.log("✅ Connected to MongoDB"))
  .then(() => {
    app.listen(5000, () => console.log("🚀 Server started on port 5000"));
  })
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Register -----------------------------
require("./Models/RegisterModel");
const User = mongoose.model("RegisterModel");

app.post("/register", async (req, res) => {
  const { Fname, Lname, email, password, confirmpassword, age } = req.body;     
  try {
    await User.create({
      Fname,
      Lname,
      email,
      password,
      confirmpassword,
      age,
    });
    res.send({ status: "ok" });  // ✅ fixed
  } catch (err) {
    console.error(err);
    res.send({ status: "err" });
  }
});

// Login ----------------------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;  // ✅ match frontend fields
  try {
    const user = await User.findOne({ email: email });  // ✅ search by email  
    if (!user) {
      return res.json({ err: "User not found" });
    }

    if (user.password === password) {  // ✅ check password
      return res.json({ status: "ok", user }); // return user info too
    } else {
      return res.json({ err: "Incorrect Password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Server Error" });
  }
});

// Register Pet ----------------------------------
require("./Models/RegisterPetModel");
const pet = mongoose.model("RegisterPetModel");

app.post("/registerpet", async (req, res) => {
  const { name, age, breed } = req.body;
  try {
    await pet.create({
      name,
      breed,
      age,
    });
    res.send({ status: "ok" });  // ✅ fixed
  } catch (err) {
    console.error(err);
    res.send({ status: "err" });
  }

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}



const startExpiryJob = () => {
  setInterval(async () => {
    try {
      const now = new Date();
      const result = await Sponsor.updateMany(
        { status: "active", endDate: { $lte: now } },
        { status: "past", updatedAt: Date.now() }
      );
      if (result.modifiedCount) {
        console.log(`Expired -> past: ${result.modifiedCount}`);
      }
    } catch (e) {
      console.error("Expiry job error", e.message);
    }
  }, 30 * 1000); // every 30s
};




});