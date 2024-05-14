import axios from 'axios';
import { User } from '../models/User';
exports.getContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const response = await axios.get(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};
