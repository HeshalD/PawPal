const mongoose = require ("mongoose");
const Schema = mongoose.Schema;

const adoptionSchema = new Schema({
    fullName:{
        type:String,//dataType
        required:true,//validate
    },
    email:{
        type:String,//dataType
        required:true,//validate
    },
    age:{
        type:Number,//dataType
        required:true,//validate
    },
    phone:{
        type:String,//dataType
        required:true,//validate
    },
    address:{
        type:String,//dataType
        required:true,//validate
    },
    salary:{
        type:Number,//dataType
        required:true,//validate
    },
    selectedPets:{
        type:[String],//array of strings
        required:true,//validate
    },
    salarySheet:{
        type:String,//file path
        required:true,//validate
    }
});




module.exports = mongoose.model(
    "AdoptionModel" ,//file name
    adoptionSchema //function name

);
