const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    Fname:{
        type:String, //datatype
        required:true //validate
    },
    Lname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    confirmpassword:{
        type:String,
        required:true,
    },
    age:{
        type:Number,
        required:true,
    },
    loginTime: {
        type: Date,
        default: null,
    },
    secondLoginTime: {
        type: Date,
        default: null,
    }
});

module.exports = mongoose.model(
    "RegisterModel", //file name
    userSchema  //function name
)