import express from 'express';
import { startAuth, authCallback } from '../controllers/authController';

const router = express.Router();

router.get('/auth/hubspot', startAuth);
router.get('/auth/hubspot/callback', authCallback);

export default router;
