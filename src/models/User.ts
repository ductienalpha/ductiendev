import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verify_code: { type: String, default: null },
  accounts: [{
    wolvesville_username: { type: String, required: true },
    wolvesville_id: { type: String, required: true }
  }],
  pending_link: {
    wolvesville_username: { type: String, default: null },
    verify_code: { type: String, default: null }
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

// To ensure backward compatibility where `user.wolvesville_username` is accessed:
UserSchema.virtual('wolvesville_username').get(function() {
  return this.accounts && this.accounts.length > 0 ? this.accounts[0].wolvesville_username : null;
});
UserSchema.virtual('wolvesville_id').get(function() {
  return this.accounts && this.accounts.length > 0 ? this.accounts[0].wolvesville_id : null;
});

// Needed for virtuals to be included in toJSON() calls
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

const User = models.User || model('User', UserSchema);

export default User;
