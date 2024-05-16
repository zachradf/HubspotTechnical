import axios from 'axios';
import { User } from '../models/User.js';

export const getContacts = async (req, res) => {
// Retrieve user from the database using the stored session userId
const user = await User.findById(req.session.userId);
if (!user) {
    return res.status(404).send('User not found');
}

try {
    const response = await axios.get(
        'https://api.hubapi.com/crm/v3/objects/contacts',
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
          params: {
            limit: 100,
          }
       }
    );

    const newContacts = response.data.results.map(contact => ({
    archived: contact.archived,
    createdAt: contact.createdAt,
    id: contact.id,
    properties: contact.properties,
    updatedAt: contact.updatedAt
  }));

  // Replace old contacts with new ones
  user.contacts = newContacts; 
  await user.save();

  res.json(response.data);
} catch (error) {
    console.error('Error fetching contacts:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching contacts');
}};

export const createContact = async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
  
    try {
      const response = await axios.post('https://api.hubapi.com/crm/v3/objects/contacts', req.body, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`, // Replace with your actual access token
          'Content-Type': 'application/json'
        }
      });
      console.log('Contact created:', response.data);
    } catch (error) {
      console.error('Failed to create contact:', error.response ? error.response.data : error.message);
    }
};

export const updateContact = async (req, res) => {
    const contactId = req.params.id;
    const properties = req.body; // Assuming the properties to update are sent in the body of the request
    const user = await User.findById(req.session.userId);
    console.log("Using access token:", user, req.session.userId, user.accessToken);
  
    if (!user) {
        return res.status(404).send('User not found');
    }
    try {
      const response = await axios.patch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
        properties
      }, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Contact updated:', response.data);
      res.send(response.data);
    } catch (error) {
      console.error('Failed to update contact:', error.response ? error.response.data : error.message);
      res.status(500).send('Failed to update contact');
    }
};

export const deleteContact = async (req, res) => {
    const user = await User.findById(req.session.userId);
    const contactId = req.params.id
    if (!user) {
        return res.status(404).send('User not found');
    }
    try {
      const response = await axios.delete(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Contact Deleted:', response);
      res.send(response.data);
    } catch (error) {
      console.error('Failed to delete contact:', error.response ? error.response.data : error.message);
      res.status(500).send('Failed to delete contact');
    }
};
