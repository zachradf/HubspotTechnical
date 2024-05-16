import axios from 'axios';
import { User } from '../models/User.js';

export const authenticateUser = async (req, res) => {
  const { state, code } = req.query;

  if (!state || state !== req.session.oauthState) {
    return res.status(403).json({ message: 'State mismatch, possible CSRF attack' });
  }

  req.session.oauthState = null; // Clear the session state after verification

  if (!code) {
    return res.status(400).json({ message: 'Authorization code not found' });
  }

  try {
    const formData = {
      grant_type: 'authorization_code',
      client_id: process.env.HUBSPOT_CLIENT_ID,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET,
      redirect_uri: process.env.HUBSPOT_CALLBACK_URL,
      code
    };

    const tokenResponse = await axios.post('https://api.hubapi.com/oauth/v1/token', new URLSearchParams(formData), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const user = await User.findOneAndUpdate(
      { hubspotId: tokenResponse.data.user },
      { accessToken: tokenResponse.data.access_token, refreshToken: tokenResponse.data.refresh_token },
      { upsert: true, new: true }
    );

    req.session.userId = user._id;
    res.redirect('http://localhost:3000/');
  } catch (error) {
    console.error('Failed to exchange token:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to exchange token', details: error.message });
  }
};

export const checkAuthentication = (req, res) => {
  res.json({ isAuthenticated: !!req.session.userId });
};
