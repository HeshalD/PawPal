const DoctorAvailability = require('../Models/DoctorAvailability');

exports.addAvailability = async (req, res) => {
  try {
    const availability = new DoctorAvailability(req.body);
    await availability.save();
    res.status(201).json(availability);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const avail = await DoctorAvailability.find();
    res.json(avail);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
