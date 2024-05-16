import express from 'express';
import { startAuth, authCallback } from '../controllers/authController.js';

const router = express.Router();

router.get('/auth/hubspot', startAuth);
router.get('/auth/hubspot/callback', authCallback);

export default router;
