const Adoption = require("../Model/AdoptionModel");
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'salary-sheet-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Only allow PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Data Display
const getAllAdoptions = async (req, res, next) => {
    let adoptions;
    try {
        adoptions = await Adoption.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching adoptions", error: err.message });
    }
    // not found
    if (!adoptions) {
        return res.status(404).json({ message: "Adoptor not found" });
    }
    //Display all adoptions
    return res.status(200).json({ adoptions });
};

//Data Insert
const addAdoptions = async (req, res, next) => {
    try {
        const { fullName, email, age, phone, address, salary, selectedPets } = req.body;
        
        // Parse selectedPets if it's a JSON string
        let parsedSelectedPets = selectedPets;
        if (typeof selectedPets === 'string') {
            parsedSelectedPets = JSON.parse(selectedPets);
        }

        // Get the uploaded file path
        const salarySheetPath = req.file ? req.file.path : null;
        
        if (!salarySheetPath) {
            return res.status(400).json({ message: "Salary sheet PDF is required" });
        }

        const adoption = new Adoption({ 
            fullName, 
            email, 
            age: parseInt(age), 
            phone, 
            address, 
            salary: parseInt(salary), 
            selectedPets: parsedSelectedPets,
            salarySheet: salarySheetPath
        });
        
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
    const{fullName,email,age,phone,address,salary,selectedPets} = req.body;

    let adoptions;

    try{
        adoptions = await Adoption.findByIdAndUpdate(id,
        {fullName: fullName, email: email, age: age, phone: phone, address: address, salary: salary, selectedPets: selectedPets, updatedAt: Date.now()}, {new: true})
    }catch(err) {
        console.log(err);
    }
    //not available users
    if(!adoptions){
        return res.status(404).json({message:" Unable to update adoption details."}); 
    }
    return res.status(200).json({ adoptions });

};

//Update adoption status (Admin only)
const updateAdoptionStatus = async (req, res, next) => {
    const id = req.params.id;
    const { status, adminNotes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({message: "Invalid status. Must be one of: pending, approved, rejected, completed"});
    }

    let adoption;

    try{
        adoption = await Adoption.findByIdAndUpdate(id,
        {
            status: status, 
            adminNotes: adminNotes || '',
            updatedAt: Date.now()
        }, 
        {new: true})
    }catch(err) {
        console.log(err);
        return res.status(500).json({message: "Error updating status", error: err.message});
    }
    
    if(!adoption){
        return res.status(404).json({message:"Adoption record not found."}); 
    }
    return res.status(200).json({ adoption });
};

//Get adoption by email (for user to check their application status)
const getAdoptionByEmail = async (req, res, next) => {
    const email = req.params.email;

    let adoptions;

    try{
        adoptions = await Adoption.find({email: email}).sort({submittedAt: -1});
    }catch (err) {
        console.log(err);
        return res.status(500).json({message: "Error fetching adoptions", error: err.message});
    }
    
    if(!adoptions || adoptions.length === 0){
        return res.status(404).json({message:"No adoption applications found for this email."}); 
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
exports.updateAdoptionStatus = updateAdoptionStatus;
exports.getAdoptionByEmail = getAdoptionByEmail;
exports.DeleteAdoptions = DeleteAdoptions;
exports.upload = upload;