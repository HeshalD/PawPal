const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json()); 

//Database Connection
mongoose.connect("mongodb+srv://isuruadikari2001:12345@pawpal.zwmke35.mongodb.net/")

.then(() =>console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000);
})

.catch((err) => console.log((err)))
