const HealthRecord = require('../Models/HealthRecord');
const DoctorAvailability = require('../Models/DoctorAvailability');
const Appointment = require('../Models/Appointment');

// Very light-weight intent detection. No external AI dependency.
function detectIntent(text) {
  const msg = text.toLowerCase();
  if (/hello|hi|hey/.test(msg)) return 'greeting';
  if (msg.includes('emergency')) return 'emergency';
  if (msg.includes('vaccination')) return 'vaccination_info';
  if (msg.includes('availability')) return 'doctor_availability';
  // Broaden appointment detection to catch paraphrases even without the exact word "appointment".
  // This is intentionally conservative to avoid collisions with existing intents.
  if (
    msg.includes('appointment') ||
    /(re\s?schedul|cancel|reslot|change|move|shift).*(time|slot|booking|visit)/.test(msg) ||
    /(book|schedule|make).*(visit|checkup|consult)/.test(msg) ||
    /(who.*free|who.*available|free.*week|available.*this\s*(week|day|month))/.test(msg) ||
    /(upcoming|my\s+appointments|next\s+visit)/.test(msg) ||
    /(approved|pending|status).*(appointment|booking)/.test(msg)
  ) {
    return 'appointments';
  }
  if (msg.includes('record')) return 'health_record';
  return 'fallback';
}

// Extract a simple name after keywords like "for <name>" or "of <name>"
function extractName(text) {
  const m = text.match(/(?:for|of)\s+([a-zA-Z\s'-]{2,})$/i);
  return m ? m[1].trim() : '';
}

// Lightweight appointment FAQ classifier to keep responses short and friendly.
// This does not call databases and does not change existing flows for other intents.
function classifyAppointmentFAQ(text) {
  const msg = (text || '').toLowerCase();

  const isBooking = /\b(book|schedule|make)\b.*\b(appointment|visit|consult|check\s*up)\b/.test(msg) || /how\s+to\s+book/.test(msg);
  if (isBooking) return 'booking';

  const isReschedule = /(re\s?schedul|change|move|shift|modify|edit).*(appointment|time|slot|booking)/.test(msg) || /can\s+i\s+change\s+my\s+appointment/.test(msg);
  if (isReschedule) return 'reschedule';

  const isCancel = /\b(cancel|call\s+off|drop)\b.*(appointment|booking)/.test(msg);
  if (isCancel) return 'cancel';

  const isAvailability = /(who.*free|who.*available|which\s+doctor.*available|doctor.*availability|available\s+slots?)/.test(msg);
  if (isAvailability) return 'doctor_availability_faq';

  const isNoDoctors = /(no\s+doctor.*available|fully\s*booked|no\s+slots|nothing\s+available)/.test(msg);
  if (isNoDoctors) return 'no_doctors';

  const isUpcoming = /(upcoming|my\s+appointments|next\s+appointment|view\s+appointments)/.test(msg);
  if (isUpcoming) return 'upcoming';

  const isStatus = /(approved|pending|confirm|status).*(appointment|booking)/.test(msg) || /(is\s+my\s+appointment\s+(approved|confirmed|pending))/.test(msg);
  if (isStatus) return 'status';

  return '';
}

exports.chatbotResponse = async (req, res) => {
  try {
    const { message = '', role = 'user' } = req.body;
    const intent = detectIntent(message);

    // Shared responses
    if (intent === 'greeting') {
      return res.json({ reply: role === 'veterinarian' ? 'Hello Doctor! How can I assist with today’s cases?' : 'Hello! How can I help you and your pet today?' });
    }

    if (intent === 'emergency') {
      return res.json({
        reply: 'If this is an emergency: Keep your pet warm, apply gentle pressure for bleeding, and contact the nearest 24/7 clinic immediately. Do you want me to help schedule the earliest appointment?'
      });
    }

    // User-focused intents
    if (role === 'user') {
      if (intent === 'vaccination_info') {
        const petName = extractName(message);
        if (petName) {
          const record = await HealthRecord.findOne({ petName: new RegExp('^' + petName + '$', 'i') }).lean();
          if (record && record.nextVaccinationDate) {
            return res.json({ reply: `Next vaccination for ${record.petName} is on ${new Date(record.nextVaccinationDate).toDateString()}.` });
          }
        }
        return res.json({ reply: 'Vaccinations should follow your pet’s schedule. You can check or add this under Health Records.' });
      }

      if (intent === 'doctor_availability') {
        const name = extractName(message);
        const q = name ? { doctorName: new RegExp(name, 'i') } : {};
        const slots = await DoctorAvailability.find(q).sort({ availableDate: 1 }).limit(5).lean();
        if (slots.length === 0) {
          return res.json({ reply: 'No upcoming availability found. Try again later or contact the clinic.' });
        }
        const summary = slots.map(s => `${s.doctorName} on ${new Date(s.availableDate).toDateString()}${Array.isArray(s.timeSlots)&&s.timeSlots.length? ' at ' + s.timeSlots.join(', ') : ''}`).join(' | ');
        return res.json({ reply: `Upcoming availability: ${summary}` });
      }

      if (intent === 'appointments') {
        // New: detect specific appointment FAQs and respond with concise in-app guidance.
        const kind = classifyAppointmentFAQ(message);
        if (kind === 'booking') {
          return res.json({ reply: 'You can book from the Appointments page. Click “Book Appointment”, pick the doctor, date, and an available time slot, then submit.' });
        }
        if (kind === 'reschedule') {
          return res.json({ reply: 'To reschedule, go to Appointments and click “Edit” next to your booking. Choose a new date/time and save.' });
        }
        if (kind === 'cancel') {
          return res.json({ reply: 'To cancel, open the Appointments page and click “Cancel” on the booking you no longer need.' });
        }
        if (kind === 'doctor_availability_faq') {
          return res.json({ reply: 'To check doctor availability, open Appointments and filter by doctor and date to see open time slots.' });
        }
        if (kind === 'no_doctors') {
          return res.json({ reply: 'If no doctors are available, try another date or doctor. You can also check again later or contact the clinic.' });
        }
        if (kind === 'upcoming') {
          return res.json({ reply: 'You can view upcoming appointments on the Appointments page under “My Appointments”.' });
        }
        if (kind === 'status') {
          return res.json({ reply: 'Open the Appointments page and check the Status column for Approved or Pending.' });
        }
        // Default appointment help (existing behavior preserved but refined wording)
        return res.json({ reply: 'You can book an appointment from the Appointments page. Tell me the doctor and date to check availability.' });
      }

      if (intent === 'health_record') {
        const petName = extractName(message);
        if (petName) {
          const record = await HealthRecord.findOne({ petName: new RegExp(petName, 'i') }).lean();
          if (record) {
            return res.json({ reply: `${record.petName} — last diagnosis: ${record.diagnosis}. Treatment: ${record.treatment}.` });
          }
        }
        return res.json({ reply: 'I could not find that record. You can create or search it in Health Records.' });
      }
    }

    // Veterinarian-focused intents
    if (role === 'veterinarian') {
      if (intent === 'appointments') {
        const start = new Date(); start.setHours(0,0,0,0);
        const end = new Date(); end.setHours(23,59,59,999);
        const appts = await Appointment.find({ date: { $gte: start, $lte: end } }).sort({ date: 1 }).limit(10).lean();
        if (appts.length === 0) {
          return res.json({ reply: 'No appointments scheduled for today.' });
        }
        const list = appts.map(a => `${a.petName} (${a.ownerName}) with Dr. ${a.doctorName} at ${a.timeSlot}`).join(' | ');
        return res.json({ reply: `Today’s appointments: ${list}` });
      }

      if (intent === 'doctor_availability') {
        const name = extractName(message);
        if (!name) return res.json({ reply: 'Please specify the doctor name, e.g., availability for Dr. Smith.' });
        const slots = await DoctorAvailability.find({ doctorName: new RegExp(name, 'i') }).sort({ availableDate: 1 }).limit(5).lean();
        if (slots.length === 0) return res.json({ reply: `No upcoming availability found for ${name}.` });
        const summary = slots.map(s => `${new Date(s.availableDate).toDateString()} ${Array.isArray(s.timeSlots)&&s.timeSlots.length? '(' + s.timeSlots.join(', ') + ')' : ''}`).join(' | ');
        return res.json({ reply: `Upcoming availability for ${slots[0].doctorName}: ${summary}` });
      }

      if (intent === 'health_record') {
        const petName = extractName(message);
        if (!petName) return res.json({ reply: 'Please provide the pet name, e.g., record for Bella.' });
        const record = await HealthRecord.findOne({ petName: new RegExp(petName, 'i') }).lean();
        if (!record) return res.json({ reply: `No record found for ${petName}.` });
        return res.json({ reply: `${record.petName} — Dx: ${record.diagnosis}; Tx: ${record.treatment}; Next vaccine: ${record.nextVaccinationDate ? new Date(record.nextVaccinationDate).toDateString() : 'not set'}.` });
      }
    }

    // Fallback
    return res.json({ reply: role === 'veterinarian' ? 'I did not catch that, Doctor. Try asking about appointments, availability, or a pet record.' : 'I am not sure. You can ask me about vaccinations, doctor availability, appointments, or a health record.' });
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
};
