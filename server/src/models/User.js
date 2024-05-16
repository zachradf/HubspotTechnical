import mongoose from 'mongoose';
import {contactSchema } from './Contact.js';

const UserSchema = new mongoose.Schema({
  hubspotId: String,
  accessToken: String,
  refreshToken: String,
  contacts: [contactSchema]  // Embedding contacts directly
});

export const User = mongoose.model('User', UserSchema);
