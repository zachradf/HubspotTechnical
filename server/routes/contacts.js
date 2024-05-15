const express = require('express');
const router = express.Router();
const { getContacts } = require('../controllers/contactController');
const { ensureAuth } = require('../middleware/authMiddleware');

router.get('/', ensureAuth, getContacts);

module.exports = router;
