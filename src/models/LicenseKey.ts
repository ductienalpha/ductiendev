import mongoose, { Schema, model, models } from 'mongoose';

const LicenseKeySchema = new Schema({
  key: { type: String, required: true, unique: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  target_username: { type: String, default: null },
  duration_days: { type: Number, required: true },
  expires_at: { type: Date, default: null },
  status: { type: String, enum: ['unclaimed', 'active', 'expired', 'paused'], default: 'unclaimed' },
  is_paused: { type: Boolean, default: false },
  paused_at: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

const LicenseKey = models.LicenseKey || model('LicenseKey', LicenseKeySchema);

export default LicenseKey;
