require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Configuración
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://limelab30.vercel.app',
  credentials: true
}));
app.use(bodyParser.json());

// Configuración del transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Plantillas de correo
const contactEmailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Nuevo contacto de ${data.name}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; padding: 20px; color: white; text-align: center; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; }
        .footer { margin-top: 20px; font-size: 12px; text-align: center; color: #777; }
        .info-item { margin-bottom: 10px; }
        .message { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
        hr { border: 0; height: 1px; background-color: #ddd; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LIMELAB</h1>
        <h2>Nuevo mensaje de contacto</h2>
    </div>
    
    <div class="content">
        <div class="info-item"><strong>Nombre:</strong> ${data.name}</div>
        <div class="info-item"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></div>
        ${data.company ? `<div class="info-item"><strong>Empresa:</strong> ${data.company}</div>` : ''}
        
        <hr>
        
        <h3>Mensaje:</h3>
        <div class="message">
            ${data.message.replace(/\n/g, '<br>')}
        </div>
    </div>
    
    <div class="footer">
        <p>Este mensaje fue enviado a través del formulario de contacto de LIMELAB</p>
        <p>© ${new Date().getFullYear()} LIMELAB. Todos los derechos reservados.</p>
    </div>
</body>
</html>
`;

const confirmationEmailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Gracias por contactar a LIMELAB</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; padding: 20px; color: white; text-align: center; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; }
        .footer { margin-top: 20px; font-size: 12px; text-align: center; color: #777; }
        .info-item { margin-bottom: 10px; }
        .message { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .signature { margin-top: 30px; font-style: italic; }
        .highlight { color: #2c3e50; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LIMELAB</h1>
        <h2>¡Gracias por contactarnos!</h2>
    </div>
    
    <div class="content">
        <p>Hola ${data.name},</p>
        
        <p>Hemos recibido tu mensaje y queremos agradecerte por ponerte en contacto con nosotros.</p>
        
        <div class="message">
            <p><strong>Resumen de tu mensaje:</strong></p>
            ${data.message.replace(/\n/g, '<br>')}
        </div>
        
        <p>Nuestro equipo revisará tu consulta y se pondrá en contacto contigo en <span class="highlight">menos de 24 horas</span>.</p>
        
        <p>Si necesitas asistencia inmediata, por favor llámanos al número de atención al cliente.</p>
        
        <div class="signature">
            <p>Atentamente,</p>
            <p>El equipo de LIMELAB</p>
        </div>
    </div>
    
    <div class="footer">
        <p>Este es un correo automático. Por favor no respondas directamente a este mensaje.</p>
        <p>© ${new Date().getFullYear()} LIMELAB. Todos los derechos reservados.</p>
    </div>
</body>
</html>
`;

// Ruta de contacto mejorada
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, company, message } = req.body;

    // Validación mejorada
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Nombre, email y mensaje son campos requeridos' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Por favor ingresa un email válido' 
      });
    }

    // Configuración del correo para LIMELAB
    const contactMailOptions = {
      from: `"Formulario de Contacto" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Nuevo mensaje de ${name}${company ? ` (${company})` : ''}`,
      text: `
        Nombre: ${name}
        Email: ${email}
        ${company ? `Empresa: ${company}` : ''}
        
        Mensaje:
        ${message}
      `,
      html: contactEmailTemplate({ name, email, company, message })
    };

    // Configuración del correo de confirmación
    const confirmationMailOptions = {
      from: `"LIMELAB" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Gracias por contactar a LIMELAB',
      html: confirmationEmailTemplate({ name, message })
    };

    // Envío de ambos correos en paralelo
    await Promise.all([
      transporter.sendMail(contactMailOptions),
      transporter.sendMail(confirmationMailOptions)
    ]);

    res.status(200).json({ 
      success: true, 
      message: 'Correo enviado exitosamente' 
    });
    
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ 
      error: 'Error al enviar el mensaje',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
