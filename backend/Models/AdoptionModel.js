const mongoose = require ("mongoose");
const Schema = mongoose.Schema;

const adoptionSchema = new Schema({
    name:{
        type:String,//dataType
        required:true,//validate
    },
    gmail:{
        type:String,//dataType
        required:true,//validate
    },
    age:{
        type:Number,//dataType
        required:true,//validate
    }
});




module.exports = mongoose.model(
    "AdoptionModel" ,//file name
    adoptionSchema //function name

);
