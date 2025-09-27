const path = require("path");
const fs = require("fs");
const Sponsor = require("../Models/SponsorModel");

const refreshExpiredStatuses = async () => {
  const now = new Date();
  await Sponsor.updateMany(
    { status: "active", endDate: { $lte: now } },
    { status: "past", updatedAt: Date.now() }
  );
};

const toWebPath = (absolutePath) => {
  if (!absolutePath) return null;
  const uploadsRoot = path.join(__dirname, "..", "uploads");
  const relativeFromUploads = path.relative(uploadsRoot, absolutePath);
  const webSafe = relativeFromUploads.split(path.sep).join("/");
  return "/" + webSafe;
};

const toDiskPath = (webPath) => {
  if (!webPath) return null;
  const uploadsRoot = path.join(__dirname, "..", "uploads");
  const trimmed = webPath.replace(/^\//, "");
  return path.join(uploadsRoot, trimmed);
};

const validateSponsorPayload = (body) => {
  console.log('Validating payload:', body);
  
  const required = ["sponsorName", "email", "phone", "durationMonths", "sponsorAmount"];
  for (const key of required) {
    if (!body[key] && body[key] !== 0) {
      console.log(`Validation failed: ${key} is missing`);
      return `${key} is required`;
    }
  }
  
  const allowedDurations = [3, 6, 9, 12, 0.001];
  const duration = Number(body.durationMonths);
  if (!allowedDurations.includes(duration)) {
    console.log('Validation failed: Invalid duration', duration);
    return "durationMonths must be one of 3, 6, 9, 12, or 0.001 (for testing)";
  }
  
  // Validate sponsor amount
  const amount = Number(body.sponsorAmount);
  console.log('Sponsor amount validation:', {
    original: body.sponsorAmount,
    converted: amount,
    isNaN: isNaN(amount),
    lessThan50k: amount < 50000
  });
  
  if (isNaN(amount) || amount < 50000) {
    console.log('Validation failed: Invalid sponsor amount');
    return "sponsorAmount must be a number and at least 50,000";
  }
  
  return null;
};

const createSponsor = async (req, res, next) => {
  try {
    console.log('=== CREATE SPONSOR REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Log each field individually
    Object.keys(req.body).forEach(key => {
      console.log(`${key}: "${req.body[key]}" (type: ${typeof req.body[key]})`);
    });
    
    const validationError = validateSponsorPayload(req.body);
    if (validationError) {
      console.log('Validation error:', validationError);
      return res.status(400).json({ message: validationError });
    }

    const adPath = req.file ? toWebPath(req.file.path) : null;

    // Convert values explicitly
    const sponsorData = {
      sponsorName: String(req.body.sponsorName).trim(),
      companyName: req.body.companyName ? String(req.body.companyName).trim() : null,
      email: String(req.body.email).toLowerCase().trim(),
      phone: String(req.body.phone).trim(),
      address: req.body.address ? String(req.body.address).trim() : null,
      durationMonths: Number(req.body.durationMonths),
      sponsorAmount: Number(req.body.sponsorAmount),
      adImagePath: adPath,
    };
    
    console.log('Sponsor data to save:', sponsorData);

    const sponsor = new Sponsor(sponsorData);
    const savedSponsor = await sponsor.save();
    
    console.log('Sponsor saved successfully:', {
      id: savedSponsor._id,
      sponsorName: savedSponsor.sponsorName,
      sponsorAmount: savedSponsor.sponsorAmount,
      durationMonths: savedSponsor.durationMonths
    });
    
    return res.status(201).json({ sponsor: savedSponsor });
  } catch (err) {
    console.error('Create sponsor error:', err);
    return res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const getAllSponsors = async (req, res, next) => {
  try {
    await refreshExpiredStatuses();
    const sponsors = await Sponsor.find().sort({ createdAt: -1 });
    
    // Log sponsor amounts for debugging
    console.log('All sponsors amounts:', sponsors.map(s => ({
      id: s._id,
      name: s.sponsorName,
      amount: s.sponsorAmount,
      amountType: typeof s.sponsorAmount
    })));
    
    return res.status(200).json({ sponsors: sponsors || [] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getSponsorById = async (req, res, next) => {
  try {
    await refreshExpiredStatuses();
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }
    
    console.log('Found sponsor:', {
      id: sponsor._id,
      amount: sponsor.sponsorAmount,
      amountType: typeof sponsor.sponsorAmount
    });
    
    return res.status(200).json({ sponsor });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateSponsor = async (req, res, next) => {
  try {
    const id = req.params.id;
    const sponsor = await Sponsor.findById(id);
    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }

    if (sponsor.status === "active" || sponsor.status === "past") {
      return res.status(400).json({ message: "Cannot update active or past sponsor" });
    }

    const adPath = req.file ? toWebPath(req.file.path) : sponsor.adImagePath;

    const update = {
      sponsorName: req.body.sponsorName ?? sponsor.sponsorName,
      companyName: req.body.companyName ?? sponsor.companyName,
      email: req.body.email ?? sponsor.email,
      phone: req.body.phone ?? sponsor.phone,
      address: req.body.address ?? sponsor.address,
      durationMonths: req.body.durationMonths ? Number(req.body.durationMonths) : sponsor.durationMonths,
      sponsorAmount: req.body.sponsorAmount ? Number(req.body.sponsorAmount) : sponsor.sponsorAmount,
      adImagePath: adPath,
      updatedAt: Date.now(),
    };

    const updated = await Sponsor.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json({ sponsor: updated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteSponsor = async (req, res, next) => {
  try {
    const id = req.params.id;
    const sponsor = await Sponsor.findById(id);
    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }

    if (sponsor.status === "past") {
      return res.status(400).json({ message: "Cannot delete past sponsor" });
    }

    await Sponsor.findByIdAndDelete(id);

    if (sponsor.adImagePath) {
      try {
        const diskPath = toDiskPath(sponsor.adImagePath);
        if (diskPath && fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
      } catch (_) {}
    }

    return res.status(200).json({ message: "Sponsor deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const approveSponsor = async (req, res, next) => {
  try {
    const id = req.params.id;
    const sponsor = await Sponsor.findById(id);
    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }
    if (sponsor.status !== "pending") {
      return res.status(400).json({ message: "Only pending sponsors can be approved" });
    }
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (sponsor.durationMonths === 0.001) {
      endDate.setTime(startDate.getTime() + 60 * 1000);
    } else {
      endDate.setMonth(endDate.getMonth() + Number(sponsor.durationMonths));
    }

    sponsor.status = "active";
    sponsor.startDate = startDate;
    sponsor.endDate = endDate;
    sponsor.updatedAt = Date.now();
    await sponsor.save();

    return res.status(200).json({ sponsor });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

  const rejectSponsor = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { reason } = req.body || {};
      const sponsor = await Sponsor.findByIdAndUpdate(
        id,
        {
          status: "rejected",
          rejectReason: reason || null,
          rejectedAt: Date.now(),
          updatedAt: Date.now(),
        },
        { new: true }
      );
      if (!sponsor) {
        return res.status(404).json({ message: "Sponsor not found" });
      }
      return res.status(200).json({ sponsor });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  const softDeleteSponsor = async (req, res, next) => {
    try {
      const id = req.params.id;
      const { reason } = req.body || {};
      const sponsor = await Sponsor.findById(id);
      if (!sponsor) {
        return res.status(404).json({ message: "Sponsor not found" });
      }
      if (sponsor.status === "past") {
        return res.status(400).json({ message: "Cannot delete past sponsor" });
      }

      sponsor.status = "deleted";
      sponsor.deleteReason = reason || null;
      sponsor.deletedAt = Date.now();
      sponsor.updatedAt = Date.now();
      await sponsor.save();

      return res.status(200).json({ sponsor });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

const uploadAd = async (req, res, next) => {
  try {
    const id = req.params.id;
    const adPath = req.file ? toWebPath(req.file.path) : null;
    if (!adPath) return res.status(400).json({ message: "Ad image is required" });

    const sponsor = await Sponsor.findByIdAndUpdate(
      id,
      { adImagePath: adPath, updatedAt: Date.now() },
      { new: true }
    );
    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }
    return res.status(200).json({ sponsor });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getSponsorsByStatus = async (req, res, next) => {
  try {
    await refreshExpiredStatuses();
    const { status } = req.params;
    const sponsors = await Sponsor.find({ status }).sort({ updatedAt: -1 });
    return res.status(200).json({ sponsors: sponsors || [] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getManagerPending = async (req, res, next) => {
  try {
    await refreshExpiredStatuses();
    const sponsors = await Sponsor.find({ status: "pending" }).sort({ createdAt: -1 });
    
    console.log('=== MANAGER PENDING SPONSORS ===');
    sponsors.forEach(sponsor => {
      console.log(`ID: ${sponsor._id}`);
      console.log(`Name: ${sponsor.sponsorName}`);
      console.log(`Amount: ${sponsor.sponsorAmount} (type: ${typeof sponsor.sponsorAmount})`);
      console.log('---');
    });
    
    return res.status(200).json({ sponsors: sponsors || [] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getManagerActive = async (req, res, next) => {
  try {
    await refreshExpiredStatuses();
    const sponsors = await Sponsor.find({ status: "active" }).sort({ updatedAt: -1 });
    return res.status(200).json({ sponsors: sponsors || [] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getManagerPast = async (req, res, next) => {
  try {
    await refreshExpiredStatuses();
    const sponsors = await Sponsor.find({ status: "past" }).sort({ updatedAt: -1 });
    return res.status(200).json({ sponsors: sponsors || [] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getHomepageActiveAds = async (req, res, next) => {
  try {
    await refreshExpiredStatuses();
    const now = new Date();
    const sponsors = await Sponsor.find({ 
      status: "active", 
      startDate: { $lte: now }, 
      endDate: { $gt: now }, 
      adImagePath: { $ne: null } 
    })
      .sort({ updatedAt: -1 })
      .select("companyName sponsorName adImagePath startDate endDate sponsorAmount");
    return res.status(200).json({ sponsors });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get sponsors with date filtering
const getSponsorsWithFilter = async (req, res, next) => {
  try {
    await refreshExpiredStatuses();
    const { period, search } = req.query;
    
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
          { sponsorName: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const sponsors = await Sponsor.find({ ...dateFilter, ...searchFilter }).sort({ createdAt: -1 });
    return res.status(200).json({ sponsors: sponsors || [] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get sponsor summary statistics
const getSponsorSummary = async (req, res, next) => {
  try {
    await refreshExpiredStatuses();
    
    const totalSponsors = await Sponsor.countDocuments();
    const pendingCount = await Sponsor.countDocuments({ status: 'pending' });
    const activeCount = await Sponsor.countDocuments({ status: 'active' });
    const pastCount = await Sponsor.countDocuments({ status: 'past' });
    const rejectedCount = await Sponsor.countDocuments({ status: 'rejected' });
    
    const totalAmount = await Sponsor.aggregate([
      { $group: { _id: null, total: { $sum: '$sponsorAmount' } } }
    ]);
    
    const pendingAmount = await Sponsor.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$sponsorAmount' } } }
    ]);
    
    const activeAmount = await Sponsor.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$sponsorAmount' } } }
    ]);
    
    return res.status(200).json({
      summary: {
        totalSponsors,
        totalAmount: totalAmount[0]?.total || 0,
        pendingCount,
        activeCount,
        pastCount,
        rejectedCount,
        pendingAmount: pendingAmount[0]?.total || 0,
        activeAmount: activeAmount[0]?.total || 0
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createSponsor,
  getAllSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
  approveSponsor,
  rejectSponsor,
  softDeleteSponsor,
  uploadAd,
  getSponsorsByStatus,
  getManagerPending,
  getManagerActive,
  getManagerPast,
  getHomepageActiveAds,
  getSponsorsWithFilter,
  getSponsorSummary,
};