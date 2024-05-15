import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContactCard.css';
import type Contact from '../types/Contact';

interface ContactCardProps {
  contact: Contact;
  saveContact: (id: string, properties: Partial<Contact['properties']>) => void;
  refreshContacts: Function;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  saveContact,
  refreshContacts,
}) => {
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editedContact, setEditedContact] = useState(contact.properties);

  useEffect(() => {
    setEditedContact({
      firstname: contact.properties.firstname,
      lastname: contact.properties.lastname,
      email: contact.properties.email,
    });
  }, [contact]);

  const fieldLabels = {
    firstname: 'First Name',
    lastname: 'Last Name',
    email: 'Email',
  };

  const handleEditToggle = (field: string) => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field: string, value: string) => {
    setEditedContact(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field: string) => {
    await saveContact(contact.id, { [field]: editedContact[field] });
    setEditMode({ ...editMode, [field]: false }); // Close edit mode after saving
  };
  const handleDelete = async (id: string) => {
    await axios.delete(`contacts/${id}`);
    refreshContacts();
  };

  return (
    <div className='contact-card'>
      <h3>
        <svg
          onClick={() => handleDelete(contact.properties.hs_object_id)}
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          fill='currentColor'
          className='bi bi-trash delete-icon'
          viewBox='0 0 16 16'
          style={{ cursor: 'pointer', float: 'right', color: 'red' }}
        >
          <path d='M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2 0A.5.5 0 0 1 8 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z' />
          <path
            fillRule='evenodd'
            d='M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1zm-11 1V4h10v9a1 1 0 0 0 1-1V4h-12zm2-2V2H4v1h1zm1 0V2h4v1H7zm5 0V2h-1v1h1zm.5-1h-9V2h9v1z'
          />
        </svg>
        {Object.entries(fieldLabels).map(([key, label]) =>
          editMode[key] ? (
            <div key={key}>
              <label>{label}:</label>
              <input
                type='text'
                value={editedContact[key]}
                onChange={e => handleChange(key, e.target.value)}
              />
              <button onClick={() => handleSave(key)}>Save</button>
            </div>
          ) : (
            <p key={key} onClick={() => handleEditToggle(key)}>
              {label}: {editedContact[key]}
              <span className='edit-icon'>&#9998;</span>
            </p>
          )
        )}
      </h3>
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

/* <div>
          <input
            name='name'
            value={newField.name}
            onChange={handleNewFieldChange}
            placeholder='New Field Name'
          />
          <input
            name='value'
            value={newField.value}
            onChange={handleNewFieldChange}
            placeholder='Value for New Field'
          />
          <select
            name='type'
            value={newField.type}
            onChange={handleNewFieldChange}
          >
            <option value='string'>String</option>
            <option value='number'>Number</option>
            <option value='date'>Date</option>
            <option value='bool'>Boolean</option>
          </select>
          <select
            name='fieldType'
            value={newField.fieldType}
            onChange={handleNewFieldChange}
          >
            <option value='text'>Text</option>
            <option value='textarea'>Textarea</option>
            <option value='number'>Number</option>
            <option value='date'>Date</option>
            <option value='booleancheckbox'>Boolean Checkbox</option>
            <option value='checkbox'>Checkbox</option>
            <option value='select'>Select</option>
            <option value='radio'>Radio</option>
            <option value='file'>File</option>
            <option value='html'>HTML</option>
            <option value='calculation_equation'>Calculation Equation</option>
          </select>
          <button onClick={handleAddNewField}>Add Field</button>
        </div> */
// }
