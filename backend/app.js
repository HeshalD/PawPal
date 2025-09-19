const express = require("express");
const mongoose = require("mongoose");
const router = require("./Routes/inventoryRoutes");

const app = express();
const cors = require ("cors");
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use("/items", router);




// Start server regardless of DB connection success
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

mongoose
  .connect("mongodb+srv://inventory_Manger:2cQp7CZmEF7KEWyy@cluster0.svbkvfv.mongodb.net/", {
    // useNewUrlParser and useUnifiedTopology are defaults in newer Mongoose, kept for compatibility
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
    
