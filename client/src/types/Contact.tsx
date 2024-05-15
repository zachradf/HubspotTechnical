interface Contact {
  archived: boolean;
  createdAt: string;
  id: string;
  properties: {
    [key: string]: any; // Allows any property name with any value
  };
  updatedAt: string;
}
export default Contact;
