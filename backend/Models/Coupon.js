const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercent: { type: Number, required: true, min: 1, max: 90 },
  // Optional explicit status; will also be computed from expiry/uses
  status: { type: String, enum: ['active', 'expired'], default: 'active' },
  // Default expiry 30 days from creation if not set by API
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30*24*60*60*1000) },
  // Each coupon is single-use by default as per requirement
  usesRemaining: { type: Number, default: 1, min: 0 },
}, { timestamps: true });

CouponSchema.methods.isExpired = function() {
  const byDate = this.expiresAt ? (new Date(this.expiresAt) <= new Date()) : false;
  const byUses = (this.usesRemaining || 0) <= 0;
  return byDate || byUses || this.status === 'expired';
};

module.exports = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
