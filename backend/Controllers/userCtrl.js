const User = require("../Models/userModel");

const getallUsers = async (req, res, next) => {
    let users;

    try{
        users = await User.find();
    }catch(err){
        console.log(err);
    }

    //not found
    if(!users){
        return res.status(404).json({message:"User not found"})
    }

    //display all users
    return res.status(200).json({users});
};


//data insert
const addUsers = async(req, res , next) =>{
     const {Fname,Lname,email,password,confirmpassword,age} = req.body;

     let users;

     try{
        users = new User({Fname,Lname,email,password,confirmpassword,age});
        await users.save();
     }catch (err){
        console.log(err);

     }

     //not insert users
     if (!users){
        return res.status(404).json({message:"unable to add users"});
     }
     return res.status(200).json({users});
};


//Get by ID
const getById = async(req, res, next) => {
    const id = req.params.id;

    let users;

    try{
        users = await User.findById(id);
    }catch(err){
        console.log(err);
    }
    //not avilable users
     if (!users){
        return res.status(404).json({message:"User not found"});
     }
     return res.status(200).json({users});
};

//Update user details
const updateUser = async(req, res, next) => {
    const id = req.params.id;
    const {name,age,address} = req.body;

    let users;

    try{
        users = await User.findByIdAndUpdate(id,
            { name :name, age:age, address:address});
            users = await users.save();
    }catch(err){
        console.log(err);
    }
    //not avilable users
     if (!users){
        return res.status(404).json({message:"Unable to update user."});
     }
     return res.status(200).json({users});
};

//Delete user details
const deleteUser = async(req, res, next) => {
    const id = req.params.id;

    let users;
     
    try{
        users = await User.findByIdAndDelete(id);
    }catch(err){
        console.log(err);
    }
    //not avilable users
     if (!users){
        return res.status(404).json({message:"Unable to delete user."});
     }
     return res.status(200).json({users});

};
 
exports.deleteUser = deleteUser;
exports.updateUser = updateUser;
exports.getById = getById;
exports.getallUsers = getallUsers;
exports.addUsers = addUsers;