import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  hubspotId: String,
  accessToken: String,
  refreshToken: String,
});

export const User = mongoose.model('User', UserSchema);
