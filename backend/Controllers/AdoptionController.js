const Adoption = require("../Model/AdoptionModel");

// Data Display
const getAllAdoptions = async(req, res, next) =>{

    let Adoptions;

    try{
        adoptions = await Adoption.find();
    }catch (err) {
        console.log(err);
    }
    // not found
    if(!adoptions){
        return res.status(404).json({message: "Adoptor not found"});
    }
    //Display all adoptions
    return res.status(200).json({ adoptions });

};

//Data Insert
const addAdoptions = async (req, res, next) => {
    const { name, gmail, age } = req.body;

    try {
        const adoption = new Adoption({ name, gmail, age });
        await adoption.save();
        return res.status(201).json({ adoption });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: "Unable to add Adoptor", error: err.message });
    }
}



//Get by ID
const getById = async (req, res, next) => {
    const id = req.params.id;

    let adoption;

    try{
        adoption = await Adoption.findById(id);
    }catch (err) {
        console.log(err);
    }
    //not available adoptions
    if(!adoption){
        return res.status(404).json({message:"Adoptor not found."}); 
    }
    return res.status(200).json({ adoption });

};

//Update adoption details
const UpdateAdoptions = async (req, res, next) => {
    const id = req.params.id;
    const{name,gmail,age} = req.body;

    let adoptions;

    try{
        adoptions = await Adoption.findByIdAndUpdate(id,
        {name: name, gmail: gmail, age: age})
        adoptions = await adoptions.save();
    }catch(err) {
        console.log(err);
    }
    //not available users
    if(!adoptions){
        return res.status(404).json({message:" Unable to update adoption details."}); 
    }
    return res.status(200).json({ adoptions });

};

//Delete Adoption details
const DeleteAdoptions = async (req, res, next) => {
    const id = req.params.id;

    let adoption;

    try{
        adoption = await Adoption.findByIdAndDelete(id)
    }catch (err){
        console.log(err);
    }
    if(!adoption){
        return res.status(404).json({message:" Unable to delete adoption details."}); 
    }
    return res.status(200).json({ adoption });


};




exports.getAllAdoptions = getAllAdoptions;
exports.addAdoptions = addAdoptions;
exports.getById = getById;
exports.UpdateAdoptions = UpdateAdoptions;
exports.DeleteAdoptions = DeleteAdoptions;