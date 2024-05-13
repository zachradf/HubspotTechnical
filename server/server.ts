const axios = require('axios');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const HubSpotStrategy = require('passport-hubspot').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  hubspotId: String,
  accessToken: String,
  refreshToken: String,
});
const User = mongoose.model('User', UserSchema);

// Passport Configuration
passport.use(
  new HubSpotStrategy(
    {
      clientID: process.env.HUBSPOT_CLIENT_ID,
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
      callbackURL: process.env.HUBSPOT_CALLBACK_URL,
      passReqToCallback: true,
    },
    function (req, accessToken, refreshToken, profile, done) {
      User.findOneAndUpdate(
        { hubspotId: profile.id },
        { accessToken, refreshToken },
        { upsert: true, new: true },
        (err, user) => done(err, user)
      );
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

// Routes
app.get('/auth/hubspot', passport.authenticate('hubspot'));

app.get(
  '/auth/hubspot/callback',
  passport.authenticate('hubspot', { failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);

app.get('/contacts', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).send('Not authenticated');

  const user = await User.findById(req.user.id);
  try {
    const response = await axios.get(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching contacts');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
