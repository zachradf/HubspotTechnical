import axios from 'axios';
import React, { useState } from 'react';

interface NewContactFormProps {
  setIsNewContact: React.Dispatch<React.SetStateAction<boolean>>;
}
const NewContactForm: React.FC<NewContactFormProps> = ({ setIsNewContact }) => {
  const [contactDetails, setContactDetails] = useState({
    firstname: '',
    lastname: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting new contact:', contactDetails);
    const response = await axios.post('/contacts/create', {
      properties: contactDetails,
    });

    setIsNewContact(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor='firstname'>First Name:</label>
        <input
          type='text'
          id='firstname'
          name='firstname'
          value={contactDetails.firstname}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor='lastname'>Last Name:</label>
        <input
          type='text'
          id='lastname'
          name='lastname'
          value={contactDetails.lastname}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor='email'>Email:</label>
        <input
          type='email'
          id='email'
          name='email'
          value={contactDetails.email}
          onChange={handleChange}
        />
      </div>{' '}
      <button type='submit'>Submit</button>
      <button type='button' onClick={() => setIsNewContact(false)}>
        Back
      </button>
    </form>
  );
};

export default NewContactForm;
