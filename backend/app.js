// Load environment variables FIRST
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { initializeFosterScheduler } = require("./services/fosterScheduler");
require('dotenv').config();

// Configuration
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Duleepa:lJv2dSasOC6LPFG1@cluster0.o9fdduy.mongodb.net/pawpalDB";
const JWT_SECRET = process.env.JWT_SECRET || "temporary-dev-secret-CHANGE-IN-PRODUCTION";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const EXPIRY_JOB_INTERVAL_MS = parseInt(process.env.EXPIRY_JOB_INTERVAL_MS || `${5 * 60 * 1000}`, 10);

// Route imports
const userRouter = require("./Routes/userRoute");
const petRouter = require("./Routes/petRoute");
const AdoptionRoute = require("./Routes/AdoptionRoute");
const fosterRoutes = require("./Routes/FosterRoutes");
const sponsorRoutes = require("./Routes/SponsorRoute");
const Sponsor = require("./Models/SponsorModel");
const donationRoutes = require("./Routes/DonationRoute");
const healthRecordRoutes = require('./Routes/healthRecordRoutes');
const doctorRoutes = require('./Routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const chatbotRoutes = require('./Routes/chatbotRoutes');
const aiChatRouter = require('./Routes/chatbot');
const inventoryRouter = require("./Routes/inventoryRoutes");
const orderRouter = require("./Routes/orderRoutes");
const couponRouter = require("./Routes/couponRoutes");
const Appointment = require("./Models/Appointment");
const { sendEmail } = require('./utils/mailer');

const app = express();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ 
      status: "error",
      message: "Access denied. No token provided." 
    });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: "error",
        message: "Token expired. Please login again." 
      });
    }
    res.status(400).json({ 
      status: "error",
      message: "Invalid token" 
    });
  }
};

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
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/users", userRouter);
app.use("/pets", petRouter);
app.use("/adoptions", AdoptionRoute);
app.use("/fosters", fosterRoutes);
app.use("/sponsors", sponsorRoutes);
app.use("/donations", donationRoutes);
app.use("/items", inventoryRouter);
app.use("/orders", orderRouter);
app.use("/coupons", couponRouter);
app.use('/health-records', healthRecordRoutes);
app.use('/doctor-availability', doctorRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/chatbot', chatbotRoutes);
app.use('/chatbot/ai', aiChatRouter);
app.use('/api/appointments', verifyToken, appointmentRoutes);

// User Model
require("./Models/RegisterModel");
const User = mongoose.model("RegisterModel");

// REGISTER ENDPOINT with password hashing
app.post("/register", async (req, res) => {
  const { Fname, Lname, email, password, confirmpassword, age } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        status: "error", 
        message: "User with this email already exists" 
      });
    }
    
    // Validate passwords match
    if (password !== confirmpassword) {
      return res.status(400).json({ 
        status: "error", 
        message: "Passwords do not match" 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user with hashed password
    const newUser = await User.create({
      Fname,
      Lname,
      email: email.toLowerCase(),
      password: hashedPassword,
      confirmpassword: hashedPassword,
      age,
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        _id: newUser._id, 
        email: newUser.email,
        role: 'User'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    console.log('✅ New user registered:', newUser.email);
    
    res.json({ 
      status: "ok",
      message: "Registration successful",
      token,
      user: {
        _id: newUser._id,
        Fname: newUser.Fname,
        Lname: newUser.Lname,
        email: newUser.email,
        age: newUser.age
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      status: "error", 
      message: "Registration failed" 
    });
  }
});

// LOGIN ENDPOINT with backward compatibility
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      status: "error",
      message: "Email and password are required" 
    });
  }
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ 
        status: "error",
        message: "User not found" 
      });
    }
    
    let isPasswordValid = false;
    
    // Check if password is hashed (starts with $2a$ or $2b$)
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      // Use bcrypt for hashed passwords
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text password (legacy support)
      isPasswordValid = (user.password === password);
      
      // Auto-migrate to hashed password on successful login
      if (isPasswordValid) {
        console.log('🔄 Auto-migrating password for:', user.email);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        user.confirmpassword = hashedPassword;
        await user.save();
        console.log('✅ Password migrated for:', user.email);
      }
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        status: "error",
        message: "Incorrect password" 
      });
    }
    
    // On successful auth, update login timestamps
    try {
      const now = new Date();
      // Move previous loginTime to secondLoginTime
      if (user.loginTime) {
        user.secondLoginTime = user.loginTime;
      }
      // Set current loginTime to now
      user.loginTime = now;
      await user.save();
    } catch (tsErr) {
      console.error('⚠️ Failed to update login timestamps for', user.email, tsErr);
      // Continue login even if timestamp update fails
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        _id: user._id, 
        email: user.email,
        role: 'User'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    console.log('✅ Login successful for:', user.email);
    
    res.json({ 
      status: "ok",
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        Fname: user.Fname,
        Lname: user.Lname,
        email: user.email,
        age: user.age,
        loginTime: user.loginTime,
        secondLoginTime: user.secondLoginTime
      }
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ 
      status: "error",
      message: "Server error" 
    });
  }
});

// Protected route example
app.get("/user/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -confirmpassword");
    if (!user) {
      return res.status(404).json({ 
        status: "error",
        message: "User not found" 
      });
    }
    res.json({ status: "ok", user });
  } catch (err) {
    res.status(500).json({ 
      status: "error",
      message: "Server error" 
    });
  }
});

// Pet Registration
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
    res.send({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.send({ status: "err" });
  }
});

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sponsor expiry job (runs only when DB is connected)
const startExpiryJob = () => {
  setInterval(async () => {
    // 1 = connected, 2 = connecting, 0 = disconnected, 3 = disconnecting
    if (mongoose.connection.readyState !== 1) {
      // Skip quietly when DB isn't connected to avoid noisy errors
      return;
    }
    try {
      const now = new Date();
      const result = await Sponsor.updateMany(
        { status: "active", endDate: { $lte: now } },
        { status: "past", updatedAt: Date.now() }
      );
      if (result?.modifiedCount) {
        console.log(`✅ Expired sponsorships: ${result.modifiedCount}`);
      }
    } catch (e) {
      // Reduce noisy DNS/connection logs
      const msg = String(e?.message || e);
      if (
        msg.includes('ECONNRESET') ||
        msg.includes('ENOTFOUND') ||
        msg.includes('Topology is closed') ||
        msg.includes('server selection timed out')
      ) {
        console.warn('⚠️ Skipping expiry job due to temporary DB connectivity issue');
      } else {
        console.error('❌ Expiry job error:', msg);
      }
    }
  }, EXPIRY_JOB_INTERVAL_MS);
};

// Appointment reminder job: send reminder emails the day before at ~08:00
const startAppointmentReminderJob = () => {
  // run every 60 minutes
  const ONE_HOUR = 60 * 60 * 1000;
  setInterval(async () => {
    if (mongoose.connection.readyState !== 1) return;
    try {
      const now = new Date();
      const hour = now.getHours();
      // Run only between 08:00 and 09:00 to avoid multiple sends per day
      if (hour !== 8) return;

      // Determine tomorrow's date range [00:00, 23:59:59]
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const start = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0, 0);
      const end = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59, 999);

      // Find appointments not yet reminded
      const appts = await Appointment.find({
        date: { $gte: start, $lte: end },
        reminderSent: { $ne: true },
      }).limit(200);

      for (const appt of appts) {
        try {
          const to = appt.ownerEmail;
          const subject = 'Reminder: PawPal appointment tomorrow';
          const dateStr = new Date(appt.date).toDateString();
          const text = `Hi ${appt.ownerName},\n\nThis is a reminder that your appointment for ${appt.petName} is scheduled for tomorrow.\nDate: ${dateStr}\nTime: ${appt.timeSlot}\nStatus: ${appt.status}\n\nSee you soon,\nPawPal`;
          const html = `
            <p>Hi ${appt.ownerName},</p>
            <p>This is a reminder that your appointment for <strong>${appt.petName}</strong> is scheduled for <strong>tomorrow</strong>.</p>
            <ul>
              <li><strong>Date:</strong> ${dateStr}</li>
              <li><strong>Time:</strong> ${appt.timeSlot}</li>
              <li><strong>Status:</strong> ${appt.status}</li>
            </ul>
            <p>See you soon,<br/><strong>PawPal</strong></p>
          `;
          const result = await sendEmail({ to, subject, text, html });
          if (result?.ok) {
            appt.reminderSent = true;
            await appt.save();
          }
        } catch (e) {
          // continue with others
        }
      }
    } catch (e) {
      // silent fail to avoid noisy logs
    }
  }, ONE_HOUR);
};

// MongoDB connection and server start
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    startExpiryJob();
    startAppointmentReminderJob();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` JWT Authentication enabled`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
    process.exit(1);
  });

// Export middleware
module.exports = { verifyToken };