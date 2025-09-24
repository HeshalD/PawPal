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
    },
    status:{
        type:String,//application status
        enum:['pending', 'approved', 'rejected', 'completed'],//allowed values
        default:'pending',//default status
        required:true,//validate
    },
    submittedAt:{
        type:Date,//submission date
        default:Date.now,//current date
        required:true,//validate
    },
    updatedAt:{
        type:Date,//last update date
        default:Date.now,//current date
        required:true,//validate
    },
    adminNotes:{
        type:String,//admin comments
        default:'',//empty by default
    }
});




module.exports = mongoose.model(
    "AdoptionModel" ,//file name
    adoptionSchema //function name

);
