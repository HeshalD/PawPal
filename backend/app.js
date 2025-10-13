const express = require('express');
const mongoose = require('mongoose');
const AdoptionRoute = require("./Routes/AdoptionRoute")
const fosterRoutes = require("./Routes/FosterRoutes"); // Add this line
const cors = require("cors");
const { initializeFosterScheduler } = require("./services/fosterScheduler");
require('dotenv').config();

const app = express();


//Midleware
app.use(express.json()); 
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.use("/adoptions",AdoptionRoute);
app.use("/fosters", fosterRoutes); // Foster routes usage

//Database Connection
mongoose.connect("mongodb+srv://isuruadikari2001:12345@pawpal.zwmke35.mongodb.net/")

.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5001);
    console.log("Server running on port 5001");
    
    // Initialize foster reminder scheduler
    initializeFosterScheduler();
})

.catch((err) => console.log((err)))
