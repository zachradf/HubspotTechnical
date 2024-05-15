import React, { useState, useEffect } from 'react';
import axios from 'axios';

import ContactCard from './components/ContactCard';
import NewContactForm from './components/NewContactForm';
import Contact from './types/Contact';
const App = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentContactIndex, setCurrentContactIndex] = useState(0);
  const [isNewContact, setIsNewContact] = useState(false);

  const fetchContacts = async (resetIndex = true) => {
    try {
      const response = await axios.get('/contacts');
      console.log('response', response);
      setContacts(response.data.results);
      if (resetIndex === true) setCurrentContactIndex(0);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Error fetching contacts');
    }
  };
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const authResponse = await axios.get('/is-authenticated', {
          withCredentials: true,
        });
        console.log('isAuthenticated', authResponse.data.isAuthenticated);
        setIsAuthenticated(authResponse.data.isAuthenticated);
      } catch (error) {
        console.error('Authentication check failed:', error);
      }
    };

    checkAuthentication();
    fetchContacts(false);
  }, [isNewContact]);

  const handleSaveContact = async (
    id: string,
    properties: Partial<Contact['properties']>
  ) => {
    try {
      const response = await axios.patch(`/contacts/edit/${id}`, properties);
      console.log('Contact updated', response.data);
      // Update local state or trigger a re-fetch as necessary
      fetchContacts(false);
    } catch (error) {
      console.error('Failed to update contact', error);
    }
  };

  const loginWithHubSpot = () => {
    window.location.href = 'http://localhost:5000/auth/hubspot';
  };
  const nextContact = () => {
    setCurrentContactIndex(prev => (prev + 1) % contacts.length); // Wrap around to the start
  };

  const previousContact = () => {
    setCurrentContactIndex(
      prev => (prev - 1 + contacts.length) % contacts.length
    );
  };
  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Hubspot Roledex</h1>
        {!isAuthenticated && (
          <button onClick={loginWithHubSpot}>Login with HubSpot</button>
        )}
        {error && <p>{error}</p>}
        {contacts.length > 0 && !isNewContact ? (
          <>
            <ContactCard
              saveContact={handleSaveContact}
              contact={contacts[currentContactIndex]}
              refreshContacts={fetchContacts}
            />
            <button onClick={previousContact}>Previous</button>
            <button onClick={() => setIsNewContact(true)}>
              Create New Contact
            </button>
            <button onClick={nextContact}>Next</button>
          </>
        ) : null}
        {isNewContact && <NewContactForm setIsNewContact={setIsNewContact} />}
      </header>
    </div>
  );
};

export default App;
