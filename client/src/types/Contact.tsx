interface Contact {
  archived: boolean;
  createdAt: string;
  id: string;
  properties: {
    createdate: string;
    email: string;
    firstname: string;
    hs_object_id: string;
    lastmodifieddate: string;
    lastname: string;
  };
  updatedAt: string;
}

export default Contact;
