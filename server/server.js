import axios from 'axios';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import crypto from 'crypto'
import session from 'express-session'
import dotenv from 'dotenv';
dotenv.config();
import { User } from './models/User.js';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
app.use(session({
  secret: 'verySecretValue', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  
}));

app.get('/auth/hubspot', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');  // Generate a secure random state
  req.session.oauthState = state;  

  const hubSpotAuthUrl = `https://app.hubspot.com/oauth/authorize?client_id=${encodeURIComponent(process.env.HUBSPOT_CLIENT_ID)}&optional_scope=${encodeURIComponent(process.env.SCOPES)}&scope=${encodeURIComponent('oauth')}&redirect_uri=${encodeURIComponent('http://localhost:5000/auth/hubspot/callback')}&state=${encodeURIComponent(state)}`;
  res.redirect(hubSpotAuthUrl);
});

app.get('/auth/hubspot/callback', async (req, res) => {
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
});

app.get('/contacts', async (req, res) => {
  // Check if user session exists
  if (!req.session.userId) {
      return res.status(401).send('Not authenticated');
  }

  // Retrieve user from the database using the stored session userId
  const user = await User.findById(req.session.userId);
  if (!user) {
      return res.status(404).send('User not found');
  }

  try {
      const response = await axios.get(
          'https://api.hubapi.com/crm/v3/objects/contacts',
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      const getResponse = await axios.get('https://api.hubapi.com/crm/v3/properties/contacts',{
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      })
        // Map the response to your Contact schema structure
    const newContacts = response.data.results.map(contact => ({
      archived: contact.archived,
      createdAt: contact.createdAt,
      id: contact.id,
      properties: contact.properties,
      updatedAt: contact.updatedAt
    }));

    // Replace old contacts with new ones
    user.contacts = newContacts; 
    await user.save();

    res.json(response.data);
  } catch (error) {
      console.error('Error fetching contacts:', error.response ? error.response.data : error.message);
      res.status(500).send('Error fetching contacts');
  }
});

app.get('/is-authenticated', (req, res) => {
  res.json({ isAuthenticated: req.session.userId ? true : false });
});

// Route to update a contact
app.patch('/contacts/edit/:id', async (req, res) => {
  const contactId = req.params.id;
  const properties = req.body; // Assuming the properties to update are sent in the body of the request
  const user = await User.findById(req.session.userId);
  console.log("Using access token:", user, req.session.userId, user.accessToken);

  if (!user) {
      return res.status(404).send('User not found');
  }
  try {
    const response = await axios.patch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
      properties
    }, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Contact updated:', response.data);
    res.send(response.data);
  } catch (error) {
    console.error('Failed to update contact:', error.response ? error.response.data : error.message);
    res.status(500).send('Failed to update contact');
  }
});

app.post('/contacts/create', async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) {
    return res.status(404).send('User not found');
  }

  try {
    const response = await axios.post('https://api.hubapi.com/crm/v3/objects/contacts', req.body, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`, // Replace with your actual access token
        'Content-Type': 'application/json'
      }
    });
    console.log('Contact created:', response.data);
  } catch (error) {
    console.error('Failed to create contact:', error.response ? error.response.data : error.message);
  }
})

app.post('/properties/create', async (req, res) => {
  const { propertyName, propertyType, propertyValue, propertyFieldType } = req.body;
  const user = await User.findById(req.session.userId);

  if (!user) {
    return res.status(404).send('User not found');
  }

  try {
    const response = await axios.patch('https://api.hubapi.com/crm/v3/properties/contacts', {
      name: propertyName,
      label: propertyName,
      type: propertyType,
      value: propertyValue,
      fieldType: propertyFieldType,
      groupName: 'contactinformation',
    }, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Property created:', response.data);
    res.send(response.data);
  } catch (error) {
    console.log('error', error)
    console.error('Failed to create property:', error.response ? error.response.data : error.message);
    res.status(500).send('Failed to create property');
  }
});

app.delete('/contacts/:id', async (req, res) => {
  const user = await User.findById(req.session.userId);
  const contactId = req.params.id
  if (!user) {
      return res.status(404).send('User not found');
  }
  try {
    const response = await axios.delete(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Contact Deleted:', response);
    res.send(response.data);
  } catch (error) {
    console.error('Failed to delete contact:', error.response ? error.response.data : error.message);
    res.status(500).send('Failed to delete contact');
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
