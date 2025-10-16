const DoctorAvailability = require('../Models/DoctorAvailability');
const DoctorAvailabilityEntry = require('../Models/DoctorAvailabilityEntry');
const Appointment = require('../Models/Appointment');
const mongoose = require('mongoose');

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

// --- CRUD for normalized doctor_availability entries (doctorName, date, time_slot, status) ---

exports.createEntry = async (req, res) => {
  try {
    let { doctorName, date, time_slot, status } = req.body || {};
    if (!doctorName || !date || !time_slot || !status) {
      return res.status(400).json({ message: 'doctorName, date, time_slot and status are required' });
    }
    // Validate doctorName (letters/spaces/periods, min 2 chars)
    if (!/^[A-Za-z .]{2,}$/.test(String(doctorName).trim())) {
      return res.status(400).json({ message: 'Invalid doctorName. Use letters, spaces, and periods (min 2 characters).' });
    }
    const d = new Date(date);
    d.setHours(0,0,0,0);
    // Validate date is today or future
    const today = new Date(); today.setHours(0,0,0,0);
    if (d.getTime() < today.getTime()) {
      return res.status(400).json({ message: 'Date must be today or a future date.' });
    }
    date = d;
    // Validate time_slot format: 'ALL' or HH:MM or HH:MM-HH:MM or flexible '10am to 6pm'
    const raw = String(time_slot || '').trim();
    const isAll = raw.toUpperCase() === 'ALL';
    const flexible = /^(\d{1,2})(?::?(\d{2}))?(\s*(am|pm))?(\s*(to|-){1}\s*(\d{1,2})(?::?(\d{2}))?(\s*(am|pm))?)?$/i.test(raw);
    if (!(isAll || flexible)) {
      return res.status(400).json({ message: 'Invalid time_slot. Use ALL, HH:MM, HH:MM-HH:MM, or formats like 10am to 6pm.' });
    }
    const entry = await DoctorAvailabilityEntry.create({ doctorName, date, time_slot, status });
    return res.status(201).json(entry);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate entry for doctor/date/time_slot' });
    }
    return res.status(500).json({ message: err.message });
  }
};

exports.listEntries = async (req, res) => {
  try {
    const { doctorName, from, to } = req.query || {};
    const q = {};
    if (doctorName) q.doctorName = new RegExp(doctorName, 'i');
    if (from || to) {
      q.date = {};
      if (from) q.date.$gte = new Date(from);
      if (to) q.date.$lte = new Date(to);
    }
    const items = await DoctorAvailabilityEntry.find(q).sort({ date: 1, time_slot: 1 }).lean();
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    let { doctorName, date, time_slot, status } = req.body || {};
    if (doctorName != null) {
      if (!/^[A-Za-z .]{2,}$/.test(String(doctorName).trim())) {
        return res.status(400).json({ message: 'Invalid doctorName. Use letters, spaces, and periods (min 2 characters).' });
      }
    }
    if (date) {
      const d = new Date(date);
      d.setHours(0,0,0,0);
      const today = new Date(); today.setHours(0,0,0,0);
      if (d.getTime() < today.getTime()) {
        return res.status(400).json({ message: 'Date must be today or a future date.' });
      }
      date = d;
    }
    if (time_slot != null) {
      const raw = String(time_slot || '').trim();
      const isAll = raw.toUpperCase() === 'ALL';
      const flexible = /^(\d{1,2})(?::?(\d{2}))?(\s*(am|pm))?(\s*(to|-){1}\s*(\d{1,2})(?::?(\d{2}))?(\s*(am|pm))?)?$/i.test(raw);
      if (!(isAll || flexible)) {
        return res.status(400).json({ message: 'Invalid time_slot. Use ALL, HH:MM, HH:MM-HH:MM, or formats like 10am to 6pm.' });
      }
    }
    const updated = await DoctorAvailabilityEntry.findByIdAndUpdate(
      id,
      { $set: { doctorName, date, time_slot, status } },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Entry not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    const del = await DoctorAvailabilityEntry.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ message: 'Entry not found' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Return available time slots for a given date across all doctors (status === 'available').
exports.getSlotsByDate = async (req, res) => {
  try {
    const { date } = req.query || {};
    if (!date) return res.status(400).json({ message: 'date (YYYY-MM-DD) is required' });
    const start = new Date(date);
    const end = new Date(date);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    const entries = await DoctorAvailabilityEntry.find({ date: { $gte: start, $lte: end } }).lean();
    const unavailable = entries.filter(e => e.status === 'unavailable');
    // If any 'ALL' unavailable entry exists for the date, no slots should be returned.
    const fullBlock = unavailable.some(e => String(e.time_slot).toUpperCase() === 'ALL');
    if (fullBlock) {
      return res.json({ date, slots: [], unavailable, fullBlock: true });
    }
    const availableEntries = entries.filter(e => e.status === 'available');
    const availableAll = availableEntries.some(e => String(e.time_slot).toUpperCase() === 'ALL');

    // Helpers for time parsing and slot building
    const toHHMM = (h, m) => `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    const clampHour = (h) => Math.max(0, Math.min(23, h));
    const parseTimeStr = (raw) => {
      if (!raw) return '';
      const s = String(raw).trim().toLowerCase().replace(/\s+/g, '');
      const ampmMatch = s.match(/^(\d{1,2})(?::?(\d{2}))?(am|pm)?$/);
      if (ampmMatch) {
        let h = parseInt(ampmMatch[1], 10);
        let m = parseInt(ampmMatch[2] || '00', 10);
        const ap = ampmMatch[3];
        if (ap === 'am') { if (h === 12) h = 0; }
        else if (ap === 'pm') { if (h !== 12) h = h + 12; }
        h = clampHour(h);
        m = m === 30 ? 30 : 0;
        return toHHMM(h, m);
      }
      if (/^\d{2}:\d{2}$/.test(s)) return s;
      return '';
    };

    // Build half-hour slots from HH:MM to HH:MM (end exclusive for :00, inclusive for :30)
    const buildRangeSlots = (startStr, endStr) => {
      const [sh, sm] = startStr.split(':').map(n => parseInt(n, 10));
      const [eh, em] = endStr.split(':').map(n => parseInt(n, 10));
      const slots = [];
      let h = sh, m = sm;
      const endMinutes = eh * 60 + em;
      while ((h * 60 + m) <= endMinutes - 30) {
        slots.push(toHHMM(h, m));
        if (m === 0) { m = 30; } else { h += 1; m = 0; }
      }
      return slots;
    };

    // Collect explicit single-time slots and range-based slots
    const explicitSingles = [];
    const explicitRanges = [];
    for (const e of availableEntries) {
      let ts = String(e.time_slot || '').trim();
      if (ts.toUpperCase() === 'ALL') continue;
      if (/\bto\b/i.test(ts)) ts = ts.replace(/\s*to\s*/i, '-');
      if (ts.includes('-')) {
        const [rawFrom, rawTo] = ts.split('-');
        const from = parseTimeStr(rawFrom);
        const to = parseTimeStr(rawTo);
        if (from && to) explicitRanges.push(`${from}-${to}`);
      } else {
        const single = parseTimeStr(ts);
        if (single) explicitSingles.push(single);
      }
    }

    let candidateSlots = [];
    if (explicitSingles.length > 0 || explicitRanges.length > 0) {
      const set = new Set();
      for (const s of explicitSingles) set.add(s);
      for (const r of explicitRanges) {
        const [from, to] = r.split('-').map(s => s.trim());
        for (const s of buildRangeSlots(from, to)) set.add(s);
      }
      candidateSlots = Array.from(set).sort();
    } else if (availableAll) {
      const slots = [];
      for (let h = 9; h <= 17; h++) {
        slots.push(toHHMM(h, 0));
        if (!(h === 17)) slots.push(toHHMM(h, 30));
        else slots.push(toHHMM(17, 30));
      }
      candidateSlots = slots;
    } else if (entries.length === 0) {
      const slots = [];
      for (let h = 9; h <= 17; h++) {
        slots.push(toHHMM(h, 0));
        if (!(h === 17)) slots.push(toHHMM(h, 30));
        else slots.push(toHHMM(17, 30));
      }
      candidateSlots = slots;
    }

    // Subtract any specifically unavailable time_slot entries for that date
    const unavailableSet = new Set(unavailable.map(u => String(u.time_slot)));
    candidateSlots = candidateSlots.filter(s => !unavailableSet.has(String(s)));

    // Subtract already-booked appointments for that date
    const booked = await Appointment.find({ date: { $gte: start, $lte: end } }, { timeSlot: 1 }).lean();
    const bookedSet = new Set((booked || []).map(b => String(b.timeSlot)));
    candidateSlots = candidateSlots.filter(s => !bookedSet.has(String(s)));

    return res.json({ date, slots: candidateSlots, unavailable });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
