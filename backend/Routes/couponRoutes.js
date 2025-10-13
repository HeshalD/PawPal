const express = require('express');
const Coupon = require('../Models/Coupon');

const router = express.Router();

const normalizeCoupon = (c) => {
  const expired = c.isExpired();
  return {
    _id: c._id,
    code: c.code,
    discountPercent: c.discountPercent,
    status: expired ? 'expired' : 'active',
    expiresAt: c.expiresAt,
    usesRemaining: c.usesRemaining,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
};

// GET /coupons -> { coupons: [...] }
router.get('/', async (req, res) => {
  try {
    const all = await Coupon.find({}).sort({ createdAt: -1 });
    const coupons = all.map(normalizeCoupon);
    res.json({ coupons });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch coupons' });
  }
});

// POST /coupons -> create or upsert
// body: { code, discountPercent } or { code, discount }
router.post('/', async (req, res) => {
  try {
    const code = (req.body.code || '').toString().trim().toUpperCase();
    const percent = Number(req.body.discountPercent ?? req.body.discount);
    if (!code || !percent || percent <= 0 || percent > 90) {
      return res.status(400).json({ message: 'Invalid code or discount' });
    }

    // Allow optional overrides
    const expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : undefined;
    const uses = req.body.usesRemaining != null ? Math.max(0, parseInt(req.body.usesRemaining, 10) || 0) : undefined;

    const existing = await Coupon.findOne({ code });
    if (existing) {
      if (expiresAt) existing.expiresAt = expiresAt;
      if (uses != null) existing.usesRemaining = uses;
      existing.discountPercent = percent;
      existing.status = 'active';
      await existing.save();
      return res.status(200).json({ coupon: normalizeCoupon(existing) });
    }

    const created = await Coupon.create({
      code,
      discountPercent: percent,
      status: 'active',
      ...(expiresAt ? { expiresAt } : {}),
      // single-use default; allow override
      ...(uses != null ? { usesRemaining: uses } : {}),
    });
    res.status(201).json({ coupon: normalizeCoupon(created) });
  } catch (e) {
    // Handle duplicate key error
    if (e && e.code === 11000) {
      return res.status(409).json({ message: 'Coupon already exists' });
    }
    res.status(500).json({ message: 'Failed to create coupon' });
  }
});

// DELETE /coupons/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete' });
  }
});

// DELETE /coupons  body: { code }
router.delete('/', async (req, res) => {
  try {
    const code = (req.body?.code || '').toString().trim().toUpperCase();
    if (!code) return res.status(400).json({ message: 'Code required' });
    const del = await Coupon.findOneAndDelete({ code });
    if (!del) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete' });
  }
});

// POST /coupons/validate  body: { code }
// Returns: { code, discountPercent } and marks the coupon as used (single-use)
router.post('/validate', async (req, res) => {
  try {
    const code = (req.body.code || '').toString().trim().toUpperCase();
    if (!code) return res.status(400).json({ message: 'Code required' });

    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon' });

    if (coupon.isExpired()) {
      // Mark status to expired if not already
      if (coupon.status !== 'expired') {
        coupon.status = 'expired';
        await coupon.save();
      }
      return res.status(410).json({ message: 'Coupon expired' });
    }

    // Single-use: decrement remaining and expire when 0
    coupon.usesRemaining = Math.max(0, (coupon.usesRemaining || 1) - 1);
    if (coupon.usesRemaining <= 0) {
      coupon.status = 'expired';
      // Optionally set expiresAt to now
      coupon.expiresAt = new Date();
    }
    await coupon.save();

    res.json({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discount: coupon.discountPercent,
      status: coupon.isExpired() ? 'expired' : 'active'
    });
  } catch (e) {
    res.status(500).json({ message: 'Validation failed' });
  }
});

module.exports = router;
