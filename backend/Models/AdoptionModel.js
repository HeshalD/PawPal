const mongoose = require ("mongoose");
const Schema = mongoose.Schema;

const adoptionSchema = new Schema({
    fullName:{
        type:String,required:true, },
    email:{
        type:String,required:true, },
    age:{
        type:Number,required:true, },
    phone:{
        type:String,required:true, },
    address:{
        type:String,required:true, },
    salary:{
        type:Number,required:true,},
    selectedPets:{
        type:[String],required:true, },
    salarySheet:{
        type:String,required:true, },
    status:{
        type:String,enum:['pending', 'approved', 'rejected', 'completed'],
        default:'pending',required:true, },
    submittedAt:{
        type:Date,default:Date.now,
        required:true, },
    updatedAt:{
        type:Date,default:Date.now,required:true, },
    adminNotes:{
        type:String,default:'', }
});


module.exports = mongoose.model(
    "AdoptionModel" ,//file name
    adoptionSchema //function name

);
