import React, { useState, useEffect } from 'react';
import './ContactCard.css';
import type Contact from '../types/Contact';

interface ContactCardProps {
  contact: Contact;
  saveContact: (id: string, properties: Partial<Contact['properties']>) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, saveContact }) => {
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editedContact, setEditedContact] = useState(contact.properties);

  useEffect(() => {
    setEditedContact(contact.properties);
  }, [contact]);

  const handleEditToggle = (field: string) => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field: string, value: string) => {
    setEditedContact(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field: string) => {
    await saveContact(contact.id, { [field]: editedContact[field] });
    setEditedContact(contact.properties); // Reset the editedContact
    handleEditToggle(field); // Close the edit mode
  };

  return (
    <div className='contact-card'>
      <h3>
        {editMode.firstname ? (
          <>
            <input
              type='text'
              value={editedContact.firstname}
              onChange={e => handleChange('firstname', e.target.value)}
            />
            <button onClick={() => handleSave('firstname')}>Save</button>
          </>
        ) : (
          <span onClick={() => handleEditToggle('firstname')}>
            {editedContact.firstname}
          </span>
        )}{' '}
        {editMode.lastname ? (
          <>
            <input
              type='text'
              value={editedContact.lastname}
              onChange={e => handleChange('lastname', e.target.value)}
            />
            <button onClick={() => handleSave('lastname')}>Save</button>
          </>
        ) : (
          <span onClick={() => handleEditToggle('lastname')}>
            {editedContact.lastname}
          </span>
        )}
      </h3>
      <p>
        Email:
        {editMode.email ? (
          <>
            <input
              type='email'
              value={editedContact.email}
              onChange={e => handleChange('email', e.target.value)}
            />
            <button onClick={() => handleSave('email')}>Save</button>
          </>
        ) : (
          <span onClick={() => handleEditToggle('email')}>
            {editedContact.email}
          </span>
        )}
      </p>
      <p>ID: {contact.properties.hs_object_id}</p>
      <p>Created: {contact.properties.createdate}</p>
      <p>Last Modified: {contact.properties.lastmodifieddate}</p>
      <p>Archived: {contact.archived ? 'Yes' : 'No'}</p>
      <p>Created At: {contact.createdAt}</p>
      <p>Updated At: {contact.updatedAt}</p>
    </div>
  );
};

export default ContactCard;
