const Donation = require("../Models/DonationModel");
const { sendEmail } = require("../utils/mailer");
const mongoose = require("mongoose");

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

// insert data 
const addDonations = async (req, res, next) => {
   const { fullname, age, phone, NIC, Email, Address, ContributionType, Amount, Currency, PaymentMethod, donationFrequency } = req.body;
   
   try {
    // basic required checks
    const required = ["fullname","age","phone","NIC","Email","Address","ContributionType","Amount","Currency","PaymentMethod"];
    for (const k of required) {
      if (req.body[k] === undefined || req.body[k] === null || req.body[k] === "") {
        return res.status(400).json({ message: `${k} is required` });
      }
    }
    if (isNaN(Number(Amount))) {
      return res.status(400).json({ message: "Amount must be a number" });
    }
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
    
    // Send confirmation email to donor on submission
    try {
      await sendEmail({
        to: Email,
        subject: "We received your donation request",
        html: `
          <p>Hi ${fullname},</p>
          <p>Thank you for your generosity to PawPal. We've received your donation request.</p>
          <p><strong>Contribution Type:</strong> ${ContributionType}<br/>
             <strong>Amount:</strong> ${Amount} ${Currency} <br/>
             <strong>Payment Method:</strong> ${PaymentMethod}</p>
          <p>We will notify you by email once it's processed.</p>
          <p>— PawPal Team</p>
        `,
        text: `Hi ${fullname}, Thank you for your donation request to PawPal. We will notify you once it's processed.`,
      });
    } catch (e) {
      console.warn('Donation submission email failed:', e?.message || e);
    }

    return res.status(201).json({ donation });
   } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
   }
}

// get by id
const getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
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

// update donation
const updateDonation = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const { fullname, age, phone, NIC, Email, Address, ContributionType, Amount, Currency, PaymentMethod, donationFrequency } = req.body;

    const donation = await Donation.findByIdAndUpdate(
      id,
      { fullname, age, phone, NIC, Email, Address, ContributionType, Amount, Currency, PaymentMethod, donationFrequency, updatedAt: Date.now() },
      { new: true } // document return 
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const donation = await Donation.findByIdAndUpdate(
      id,
      { status: 'completed', updatedAt: Date.now() },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Send completion/approval email to donor
    try {
      await sendEmail({
        to: donation.Email,
        subject: "Your donation has been approved",
        html: `
          <p>Hi ${donation.fullname},</p>
          <p>Thank you! Your donation has been approved/processed.</p>
          <p><strong>Contribution Type:</strong> ${donation.ContributionType}<br/>
             <strong>Amount:</strong> ${donation.Amount} ${donation.Currency}</p>
          <p>We deeply appreciate your support to PawPal.</p>
          <p>— PawPal Team</p>
        `,
        text: `Hi ${donation.fullname}, Your donation has been approved. Thank you for your support to PawPal!`,
      });
    } catch (e) {
      console.warn('Donation approval email failed:', e?.message || e);
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

// export 
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