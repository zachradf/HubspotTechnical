import express from 'express';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact
} from '../controllers/contactController';

const router = express.Router();

router.get('/contacts', getContacts);
router.post('/contacts/create', createContact);
router.patch('/contacts/edit/:id', updateContact);
router.delete('/contacts/:id', deleteContact);

export default router;
