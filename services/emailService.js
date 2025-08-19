const nodemailer = require('nodemailer');
require('dotenv').config();

// Configura el transporter (para Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendContactEmail = async (name, email, company, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.CONTACT_EMAIL, // Tu email de destino
    subject: `Nuevo mensaje de contacto de ${company || name}`,
    text: `
      Nombre: ${name}
      Email: ${email}
      Empresa: ${company || 'No especificada'}
      
      Mensaje:
      ${message}
    `,
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Empresa:</strong> ${company || 'No especificada'}</p>
      <hr>
      <h3>Mensaje:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendContactEmail };