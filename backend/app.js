const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sponsorRoutes = require("./Routes/SponsorRoute");
const Sponsor = require("./Models/SponsorModel");
const donationRoutes = require("./Routes/DonationRoute");

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.static('uploads')); // Serve uploaded files
// Allow CORS for local development (any localhost port)
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
app.use("/sponsors", sponsorRoutes);
app.use("/donations", donationRoutes);

// Auto-expire job: move active sponsors to past when endDate has passed
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

// Connect to MongoDB
mongoose.connect("mongodb+srv://Donations:mL5oPpN9YdQQ4WzQ@cluster0.vj8sdfb.mongodb.net/donationsDB?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => console.log("Server running on port 5000"));
    startExpiryJob();
  })
  .catch(err => console.error(err));

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Donation API is working!");
});