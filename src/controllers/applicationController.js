import Application from '../models/Application.js';
import { transporter } from '../utils/mailer.js';

export const applyVacancy = async (req, res) => {
  try {
    const { name, username, email, phone, vacancyId } = req.body;

    // CV faylını yoxla
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'CV fayl tələb olunur' 
      });
    }

    // Məlumatları yoxla
    if (!name || !username || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bütün xanaları doldurun' 
      });
    }

    // Application yaradırıq
    const application = new Application({
      name,
      username,
      email,
      phone,
      cvUrl: req.file.path,
      cvPublicId: req.file.filename,
      vacancyId: vacancyId || null,
    });

    await application.save();

    // Email göndərmək
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Admin emaili
      subject: `Yeni Vakansiya Müraciəti - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">Yeni Vakansiya Müraciəti</h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            <p><strong>Ad:</strong> ${name}</p>
            <p><strong>İstifadəçi adı:</strong> ${username}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefon:</strong> ${phone}</p>
            <p><strong>Müraciət tarixi:</strong> ${new Date().toLocaleString('az-AZ')}</p>
          </div>
          <p style="margin-top: 20px;">CV: <a href="${req.file.path}">CV-yə bax</a></p>
        </div>
      `,
      attachments: [
        {
          filename: `${username}_CV.pdf`,
          path: req.file.path,
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    // İstifadəçiyə təsdiq emaili
    const confirmationMail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Müraciətiniz qəbul edildi',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4CAF50;">Hörmətli ${name},</h2>
          <p>Vakansiyaya müraciətiniz uğurla qəbul edildi.</p>
          <p>Tezliklə sizinlə əlaqə saxlanılacaq.</p>
          <p style="margin-top: 30px; color: #666;">Hörmətlə,<br>HR Komandası</p>
        </div>
      `
    };

    await transporter.sendMail(confirmationMail);

    res.status(201).json({
      success: true,
      message: 'Müraciətiniz uğurla göndərildi',
      data: {
        id: application._id,
        name: application.name,
        email: application.email,
      }
    });

  } catch (error) {
    console.error('Apply Vacancy Error:', error);
    res.status(500).json({
      success: false,
      message: 'Müraciət göndərilmədi',
      error: error.message,
    });
  }
};