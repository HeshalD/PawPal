const Donation = require("../Models/DonationModel");

const getAllDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find();
    
    if (!donations || donations.length === 0) {
      return res.status(404).json({ message: "Donations not found" });
    }

    return res.status(200).json({ donations });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const createDonation = async (req, res, next) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    return res.status(201).json({ donation });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// insert data - නිවැරදි කරන ලද version
const addDonations = async (req, res, next) => {
   const { fullname, age, phone, NIC, Email, Address, ContributionType, Amount, Currency, PaymentMethod, donationFrequency } = req.body;
   
   try {
    const donation = new Donation({
      fullname, 
      age,
      phone,
      NIC, 
      Email, 
      Address, 
      ContributionType, 
      Amount, 
      Currency, 
      PaymentMethod,
      donationFrequency
    });
    
    await donation.save();
    return res.status(201).json({ donation });
   } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
   }
}

// get by id - නිවැරදි කරන ලද version
const getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const donation = await Donation.findById(id);
    
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    return res.status(200).json({ donation });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Not found" });
  }
}

// update donation - නිවැරදි කරන ලද version
const updateDonation = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { fullname, age, phone, NIC, Email, Address, ContributionType, Amount, Currency, PaymentMethod, donationFrequency } = req.body;

    const donation = await Donation.findByIdAndUpdate(
      id,
      { fullname, age, phone, NIC, Email, Address, ContributionType, Amount, Currency, PaymentMethod, donationFrequency, updatedAt: Date.now() },
      { new: true } // යාවත්කාලීන කළ document එක return කිරීමට
    );

    if (!donation) {
      return res.status(404).json({ message: "Unable to update donation" });
    }

    return res.status(200).json({ donation });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// delete donation
const deleteDonation = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // First check if donation exists and can be deleted
    const donation = await Donation.findById(id);
    
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Prevent deletion if slip has been uploaded (payment made)
    if (donation.slipUpload) {
      return res.status(400).json({ 
        message: "Cannot delete donation - payment slip has been uploaded. This donation cannot be deleted for financial record purposes." 
      });
    }

    // Prevent deletion if donation is completed
    if (donation.status === 'completed') {
      return res.status(400).json({ 
        message: "Cannot delete completed donation - this is a financial record and cannot be deleted." 
      });
    }

    // Delete the donation
    await Donation.findByIdAndDelete(id);

    return res.status(200).json({ message: "Donation successfully deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// upload slip
const uploadSlip = async (req, res, next) => {
  try {
    const id = req.params.id;
    const slipPath = req.file ? req.file.path : null;

    const donation = await Donation.findByIdAndUpdate(
      id,
      { slipUpload: slipPath, updatedAt: Date.now() },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    return res.status(200).json({ donation });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// update status to completed
const markAsCompleted = async (req, res, next) => {
  try {
    const id = req.params.id;
    const donation = await Donation.findByIdAndUpdate(
      id,
      { status: 'completed', updatedAt: Date.now() },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    return res.status(200).json({ donation });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// get donations by status
const getDonationsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const donations = await Donation.find({ status });

    if (!donations || donations.length === 0) {
      return res.status(404).json({ message: `No ${status} donations found` });
    }

    return res.status(200).json({ donations });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// get pending donations (for donation manager)
const getPendingDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ status: 'pending' }).sort({ createdAt: -1 });

    if (!donations || donations.length === 0) {
      return res.status(404).json({ message: "No pending donations found" });
    }

    return res.status(200).json({ donations });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// get completed donations (for donation manager)
const getCompletedDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ status: 'completed' }).sort({ updatedAt: -1 });

    if (!donations || donations.length === 0) {
      return res.status(404).json({ message: "No completed donations found" });
    }

    return res.status(200).json({ donations });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// නිවැරදි export කිරීම
module.exports = { 
  getAllDonations, 
  createDonation, 
  addDonations, 
  getById, 
  updateDonation,
  deleteDonation,
  uploadSlip,
  markAsCompleted,
  getDonationsByStatus,
  getPendingDonations,
  getCompletedDonations
};