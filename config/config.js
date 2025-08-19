require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  CONTACT_EMAIL: process.env.CONTACT_EMAIL
};