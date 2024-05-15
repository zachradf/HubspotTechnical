import mongoose from "mongoose";
const { Schema } = mongoose;

const contactSchema = new Schema({
  archived: Boolean,
  createdAt: Date,
  id: String,
  properties: {
    createdate: Date,
    email: String,
    firstname: String,
    hs_object_id: String,
    lastmodifieddate: Date,
    lastname: String
  },
  updatedAt: Date,
  user:String,
});

export {contactSchema}
export const Contact = mongoose.model('Contact', contactSchema);
