const express = require('express');
const mongoose = require('mongoose');
const AdoptionRoute = require("./Routes/AdoptionRoute")
const cors = require("cors");

const app = express();


//Midleware
app.use(express.json()); 
app.use(cors());

app.use("/adoptions",AdoptionRoute);

//Database Connection
mongoose.connect("mongodb+srv://isuruadikari2001:12345@pawpal.zwmke35.mongodb.net/")

.then(() =>console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5001);
})

.catch((err) => console.log((err)))
