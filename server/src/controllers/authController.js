import axios from 'axios';
import { User } from '../models/User.js';
import crypto from 'crypto'; 

export const startAuth = (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');  // Generate a secure random state
    req.session.oauthState = state;  

    const hubSpotAuthUrl = `https://app.hubspot.com/oauth/authorize?client_id=${encodeURIComponent(process.env.HUBSPOT_CLIENT_ID)}&optional_scope=${encodeURIComponent(process.env.SCOPES)}&scope=${encodeURIComponent('oauth')}&redirect_uri=${encodeURIComponent('http://localhost:5000/auth/hubspot/callback')}&state=${encodeURIComponent(state)}`;
    res.redirect(hubSpotAuthUrl);
};

export const authCallback = async (req, res) => {
    const { state, code } = req.query;

    // CSRF Protection Check
    if (!state || state !== req.session.oauthState) {
        return res.status(403).send('State mismatch, possible CSRF attack');
    }
    req.session.oauthState = null;  // Clear the session state after verification

    if (!code) {
        return res.status(400).send('Authorization code not found in the request');
    }

    try {
        const formData = {
            grant_type: 'authorization_code',
            client_id: process.env.HUBSPOT_CLIENT_ID,
            client_secret: process.env.HUBSPOT_CLIENT_SECRET,
            redirect_uri: process.env.HUBSPOT_CALLBACK_URL,
            code
        };

        const response = await axios.post('https://api.hubapi.com/oauth/v1/token', new URLSearchParams(formData), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const user = await User.findOneAndUpdate(
            { hubspotId: response.data.user },  // Assuming response contains user identifier
            { accessToken: response.data.access_token, refreshToken: response.data.refresh_token },
            { upsert: true, new: true }
        );
        req.session.userId = user._id;
        res.redirect('http://localhost:3000/');
    } catch (error) {
        console.error('Failed to exchange token:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to exchange token.');
    }
};
