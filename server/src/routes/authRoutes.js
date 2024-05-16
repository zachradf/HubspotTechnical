import express from 'express';
import { startAuth, authCallback } from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
const router = express.Router();

// router.get('/is-authenticated', isAuthenticated)
router.get('/auth/hubspot', startAuth);
router.get('/auth/hubspot/callback', authCallback);

export default router;
