//password - lJv2dSasOC6LPFG1
const express = require("express");
const mongoose = require("mongoose");
const router = require("./Routes/userRoute");
const petRouter = require("./Routes/petRoute");

const app = express();


//middleware connecting
app.use(express.json());
app.use("/users",router);
app.use("/pets",petRouter);



mongoose.connect("mongodb+srv://Duleepa:lJv2dSasOC6LPFG1@cluster0.o9fdduy.mongodb.net/")
.then(()=>console.log("Connected to MongoDB"))
.then(()=> {
    app.listen(5000);
})
.catch((err)=>console.log((err)));