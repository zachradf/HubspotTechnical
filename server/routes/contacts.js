const express = require('express');
const router = express.Router();
const { getContacts } = require('../controllers/contactController');
const { ensureAuth } = require('../middleware/authMiddleware');

console.log('above ensureAuth')
router.get('/', ensureAuth, getContacts);

module.exports = router;
