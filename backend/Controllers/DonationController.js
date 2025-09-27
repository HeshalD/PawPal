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

// Get donations with date filtering
const getDonationsWithFilter = async (req, res, next) => {
  try {
    const { period, search, status } = req.query;
    
    let dateFilter = {};
    if (period && period !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (period) {
        case 'daily':
          filterDate.setDate(now.getDate() - 1);
          break;
        case 'weekly':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'yearly':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      dateFilter = { createdAt: { $gte: filterDate } };
    }
    
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { fullname: { $regex: search, $options: 'i' } },
          { Email: { $regex: search, $options: 'i' } },
          { ContributionType: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    let statusFilter = {};
    if (status && status !== 'all') {
      statusFilter = { status };
    }
    
    const donations = await Donation.find({ ...dateFilter, ...searchFilter, ...statusFilter }).sort({ createdAt: -1 });
    return res.status(200).json({ donations: donations || [] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get donation summary statistics
const getDonationSummary = async (req, res, next) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const pendingCount = await Donation.countDocuments({ status: 'pending' });
    const completedCount = await Donation.countDocuments({ status: 'completed' });
    
    const totalAmount = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: '$Amount' } } }
    ]);
    
    const pendingAmount = await Donation.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$Amount' } } }
    ]);
    
    const completedAmount = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$Amount' } } }
    ]);
    
    return res.status(200).json({
      summary: {
        totalDonations,
        totalAmount: totalAmount[0]?.total || 0,
        pendingCount,
        completedCount,
        pendingAmount: pendingAmount[0]?.total || 0,
        completedAmount: completedAmount[0]?.total || 0
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

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
  getCompletedDonations,
  getDonationsWithFilter,
  getDonationSummary
};