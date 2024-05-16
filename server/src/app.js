import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import { isAuthenticated } from './middleware/isAuthenticated.js';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(session({
  //secret should be in .env but will leave for ease of use
  secret: 'iUi7yvXPijprZSEPz1kFNWGEnQzHEm', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  
}));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.get('/is-authenticated', isAuthenticated, (req, res) => {
  res.json({ isAuthenticated: true });
});
app.use(authRoutes);
app.use(contactRoutes);

export default app;
