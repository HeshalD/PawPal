const HealthRecord = require('../Models/HealthRecord');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// ----------------- CRUD -----------------
exports.getAllRecords = async (req, res) => {
  try {
    const records = await HealthRecord.find();
    res.json(records);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send('Invalid ID');
    const record = await HealthRecord.findById(id);
    if (!record) return res.status(404).send('Record not found');
    res.json(record);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.createRecord = async (req, res) => {
  try {
    const record = new HealthRecord(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send('Invalid ID');
    const record = await HealthRecord.findByIdAndUpdate(id, req.body, { new: true });
    if (!record) return res.status(404).send('Record not found');
    res.json(record);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send('Invalid ID');
    const record = await HealthRecord.findByIdAndDelete(id);
    if (!record) return res.status(404).send('Record not found');
    res.send('Record deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// ----------------- Vaccination Reminders -----------------

// Manual reminder
exports.sendVaccinationReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await HealthRecord.findById(id);
    if (!record) return res.status(404).send('Record not found');

    await sendEmail(
      record.ownerEmail,
      `Reminder: Your pet ${record.petName} needs vaccination on ${record.nextVaccinationDate}`
    );
    res.send('Vaccination reminder sent');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Function to send email
const sendEmail = async (to, text) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Pet Vaccination Reminder',
    text
  });
};

// Automatic reminders (daily at 9 AM)
cron.schedule('0 9 * * *', async () => {
  const today = new Date();
  const records = await HealthRecord.find({ nextVaccinationDate: { $lte: today } });
  records.forEach(record => {
    sendEmail(record.ownerEmail, `Reminder: Your pet ${record.petName} vaccination is due today`);
  });
});

// ----------------- PDF Reports -----------------
const PDFDocument = require('pdfkit');
exports.generateMedicalReport = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await HealthRecord.findById(id);
    if (!record) return res.status(404).send('Record not found');

    const doc = new PDFDocument();
    const filename = `Medical_Report_${record.petName}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);
    doc.fontSize(20).text('Pet Medical Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Pet Name: ${record.petName}`);
    doc.text(`Owner Name: ${record.ownerName}`);
    doc.text(`Pet Type: ${record.petType}`);
    doc.text(`Diagnosis: ${record.diagnosis}`);
    doc.text(`Treatment: ${record.treatment}`);
    doc.text(`Vaccination: ${record.vaccination}`);
    doc.text(`Next Vaccination Date: ${record.nextVaccinationDate}`);
    doc.end();
  } catch (err) {
    res.status(500).send(err.message);
  }
};
