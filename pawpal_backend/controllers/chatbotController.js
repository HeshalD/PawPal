const HealthRecord = require('../models/HealthRecord');
const DoctorAvailability = require('../models/DoctorAvailability');
const Appointment = require('../models/Appointment');

// Very light-weight intent detection. No external AI dependency.
function detectIntent(text) {
  const msg = text.toLowerCase();
  if (/hello|hi|hey/.test(msg)) return 'greeting';
  if (msg.includes('emergency')) return 'emergency';
  if (msg.includes('vaccination')) return 'vaccination_info';
  if (msg.includes('availability')) return 'doctor_availability';
  if (msg.includes('appointment')) return 'appointments';
  if (msg.includes('record')) return 'health_record';
  return 'fallback';
}

// Extract a simple name after keywords like "for <name>" or "of <name>"
function extractName(text) {
  const m = text.match(/(?:for|of)\s+([a-zA-Z\s'-]{2,})$/i);
  return m ? m[1].trim() : '';
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
