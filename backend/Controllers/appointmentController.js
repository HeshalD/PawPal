const Appointment = require('../Models/Appointment');
const { sendEmail } = require('../utils/mailer');

// Book new appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { petName, ownerName, ownerEmail, date, timeSlot } = req.body || {};

    // Basic validation
    if (!petName || !ownerName || !ownerEmail || !date || !timeSlot) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Prevent double booking: same calendar day + same timeSlot (pending/accepted)
    const target = new Date(date);
    const start = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 0, 0, 0, 0);
    const end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59, 999);
    const conflict = await Appointment.findOne({
      date: { $gte: start, $lte: end },
      timeSlot: timeSlot,
      status: { $in: ['pending', 'accepted'] }
    });
    if (conflict) {
      return res.status(409).json({ message: 'Doctor not available for this time. Please choose another time.' });
    }

    // Create and save
    const appointment = new Appointment({ petName, ownerName, ownerEmail, date, timeSlot });
    await appointment.save();

    // Send email notification
    let emailResult = { ok: false };
    try {
      const to = appointment.ownerEmail;
      const subject = 'Your PawPal appointment is booked';
      const dateStr = new Date(appointment.date).toDateString();
      const text = `Hi ${appointment.ownerName},\n\nYour appointment for ${appointment.petName} is booked.\nDate: ${dateStr}\nTime: ${appointment.timeSlot}\nStatus: ${appointment.status}\n\nThank you for choosing PawPal.`;
      const html = `
        <p>Hi ${appointment.ownerName},</p>
        <p>Your appointment for <strong>${appointment.petName}</strong> is booked.</p>
        <ul>
          <li><strong>Date:</strong> ${dateStr}</li>
          <li><strong>Time:</strong> ${appointment.timeSlot}</li>
          <li><strong>Status:</strong> ${appointment.status}</li>
        </ul>
        <p>Thank you for choosing <strong>PawPal</strong>.</p>
      `;
      emailResult = await sendEmail({ to, subject, text, html });
    } catch (e) {
      emailResult = { ok: false, error: e?.message || 'Email send failed' };
    }

    res.status(201).json({ appointment, email: emailResult });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1 }); // Sort by date
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get appointments by owner email
exports.getAppointmentsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email query parameter is required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const appointments = await Appointment.find({ ownerEmail: normalizedEmail }).sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update an appointment by ID
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const appointment = await Appointment.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment updated successfully', appointment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete an appointment by ID
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update appointment status (accept/reject)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Send confirmation email to user about status change
    let emailResult = { ok: false };
    try {
      const to = appointment.ownerEmail;
      const dateStr = new Date(appointment.date).toDateString();
      const isAccepted = status === 'accepted';
      const subject = isAccepted
        ? 'Your PawPal appointment is approved'
        : (status === 'rejected' ? 'Your PawPal appointment was declined' : 'Your PawPal appointment status updated');
      const text = isAccepted
        ? `Hi ${appointment.ownerName},\n\nYour appointment for ${appointment.petName} is approved.\nDate: ${dateStr}\nTime: ${appointment.timeSlot}\nStatus: ${appointment.status}\n\nSee you soon,\nPawPal`
        : (status === 'rejected'
          ? `Hi ${appointment.ownerName},\n\nWe’re sorry, your appointment for ${appointment.petName} was declined.\nDate: ${dateStr}\nTime: ${appointment.timeSlot}\nStatus: ${appointment.status}\n\nPlease book another time.\nPawPal`
          : `Hi ${appointment.ownerName},\n\nYour appointment status was updated.\nDate: ${dateStr}\nTime: ${appointment.timeSlot}\nStatus: ${appointment.status}\n\nPawPal`);
      const html = isAccepted
        ? `
          <p>Hi ${appointment.ownerName},</p>
          <p>Your appointment for <strong>${appointment.petName}</strong> is <strong>approved</strong>.</p>
          <ul>
            <li><strong>Date:</strong> ${dateStr}</li>
            <li><strong>Time:</strong> ${appointment.timeSlot}</li>
            <li><strong>Status:</strong> ${appointment.status}</li>
          </ul>
          <p>See you soon,<br/><strong>PawPal</strong></p>
        `
        : (status === 'rejected'
          ? `
            <p>Hi ${appointment.ownerName},</p>
            <p>We’re sorry, your appointment for <strong>${appointment.petName}</strong> was <strong>declined</strong>.</p>
            <ul>
              <li><strong>Date:</strong> ${dateStr}</li>
              <li><strong>Time:</strong> ${appointment.timeSlot}</li>
              <li><strong>Status:</strong> ${appointment.status}</li>
            </ul>
            <p>Please book another time.<br/><strong>PawPal</strong></p>
          `
          : `
            <p>Hi ${appointment.ownerName},</p>
            <p>Your appointment status was updated.</p>
            <ul>
              <li><strong>Date:</strong> ${dateStr}</li>
              <li><strong>Time:</strong> ${appointment.timeSlot}</li>
              <li><strong>Status:</strong> ${appointment.status}</li>
            </ul>
            <p><strong>PawPal</strong></p>
          `);

      emailResult = await sendEmail({ to, subject, text, html });
    } catch (e) {
      emailResult = { ok: false, error: e?.message || 'Email send failed' };
    }

    res.json({ message: "Status updated", appointment, email: emailResult });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};