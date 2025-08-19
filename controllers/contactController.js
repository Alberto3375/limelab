const emailService = require('../services/emailService');

const sendEmail = async (req, res, next) => {
  try {
    const { name, email, company, message } = req.body;
    
    // Validación básica
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    await emailService.sendContactEmail(name, email, company, message);
    
    res.status(200).json({ success: true, message: 'Correo enviado exitosamente' });
  } catch (error) {
    console.error('Error en sendEmail:', error);
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
};

module.exports = { sendEmail };