import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: 'verySecretValue', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  
}));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use(authRoutes);
app.use(contactRoutes);

export default app;
