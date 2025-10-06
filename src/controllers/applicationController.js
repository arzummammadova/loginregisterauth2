import Application from '../models/Application.js';
import vacancyModel from '../models/vacancyModel.js';
import { transporter } from '../utils/mailer.js';

// IP ünvanını almaq üçün helper function
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress;
};

export const applyVacancy = async (req, res) => {
  try {
    const { name, email, phone, vacancyId } = req.body;
    const ipAddress = getClientIP(req);

    // CV faylını yoxla
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'CV fayl tələb olunur (PDF formatı)' 
      });
    }

    // Məlumatları yoxla
    if (!name || !email || !phone || !vacancyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bütün xanaları doldurun' 
      });
    }

    // Vakansiya mövcudluğunu yoxla
    const vacancy = await vacancyModel.findById(vacancyId);
    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vakansiya tapılmadı'
      });
    }

    // ⚠️ IP LIMIT - Eyni IP-dən 3-dən çox müraciət yoxlamaq
    const existingApplications = await Application.countByIP(vacancyId, ipAddress);
    
    if (existingApplications >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Bu vakansiyaya artıq 3 dəfə müraciət etmisiniz. Əlavə müraciət mümkün deyil.',
        blocked: true
      });
    }

    // Application yaradırıq
    const application = new Application({
      name,
      email,
      phone,
      cvUrl: req.file.path,
      cvPublicId: req.file.filename,
      vacancyId,
      vacancyOwnerId: vacancy.createdBy, // Elanı paylaşan şəxsin ID-si
      ipAddress,
    });

    await application.save();

    // Vakansiya statistikasını yenilə
    await vacancy.incrementApplications();

    // 📧 Elan sahibinə email göndər
    if (vacancy.companyInfo?.email) {
      const ownerMailOptions = {
        from: process.env.EMAIL_USER,
        to: vacancy.companyInfo.email,
        subject: `Yeni Müraciət - ${vacancy.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
              <h2 style="color: #2563eb; margin-bottom: 20px;">🎉 Yeni Müraciət Alındı</h2>
              
              <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #1e40af;">Vakansiya:</h3>
                <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">${vacancy.title}</p>
                <p style="color: #666; margin: 5px 0;">${vacancy.org}</p>
              </div>

              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #333;">Namizəd Məlumatları:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Ad Soyad:</strong></td>
                    <td style="padding: 8px 0;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                    <td style="padding: 8px 0;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Telefon:</strong></td>
                    <td style="padding: 8px 0;">${phone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Tarix:</strong></td>
                    <td style="padding: 8px 0;">${new Date().toLocaleString('az-AZ')}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 25px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e;">
                  📎 <strong>CV əlavə edilib.</strong> Əlavəyə baxın və ya adminə daxil olun.
                </p>
              </div>

              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL}/admin/applications" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Müraciətlərə Bax
                </a>
              </div>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `${name.replace(/\s+/g, '_')}_CV.pdf`,
            path: req.file.path,
          }
        ]
      };

      await transporter.sendMail(ownerMailOptions);
    }

    // 📧 İstifadəçiyə təsdiq emaili
    const confirmationMail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Müraciətiniz qəbul edildi ✅',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin: 0;">✅ Uğurlu!</h1>
            </div>
            
            <h2 style="color: #333;">Hörmətli ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              <strong>"${vacancy.title}"</strong> vakansiyasına müraciətiniz uğurla qəbul edildi.
            </p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; color: #065f46; font-size: 15px;">
                <strong>📋 Növbəti addımlar:</strong><br/>
                Müraciətiniz nəzərdən keçirilir. Uyğun olduğunuz təqdirdə, tezliklə sizinlə əlaqə saxlanılacaq.
              </p>
            </div>

            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <p style="margin: 5px 0; color: #666;"><strong>Şirkət:</strong> ${vacancy.org}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Müraciət tarixi:</strong> ${new Date().toLocaleString('az-AZ')}</p>
            </div>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Uğurlar arzulayırıq! 🎉
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            
            <p style="color: #999; font-size: 13px; text-align: center;">
              Bu avtomatik mesajdır. Cavab verməyinizə ehtiyac yoxdur.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(confirmationMail);

    res.status(201).json({
      success: true,
      message: 'Müraciətiniz uğurla göndərildi! Tezliklə sizinlə əlaqə saxlanılacaq.',
      data: {
        id: application._id,
        name: application.name,
        email: application.email,
        remainingApplications: 3 - existingApplications - 1 // Neçə müraciət qalıb
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

// Elan sahibinin müraciətlərini görmək üçün
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id; // Auth middleware-dən gələn user ID
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { vacancyOwnerId: userId };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('vacancyId', 'title org location')
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Müraciətlər yüklənmədi',
      error: error.message
    });
  }
};

// Müraciətin statusunu dəyişmək
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Müraciət tapılmadı'
      });
    }

    // Yalnız elan sahibi status dəyişə bilər
    if (application.vacancyOwnerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bu əməliyyatı yerinə yetirmək üçün icazəniz yoxdur'
      });
    }

    application.status = status;
    application.isReadByOwner = true;
    application.readAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: 'Status yeniləndi',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Status yenilənmədi',
      error: error.message
    });
  }
};


// controllers/applicationController.js - Əlavə funksiya

// Konkret vakansiyaya müraciətləri görmək (yalnız elan sahibi üçün)
export const getVacancyApplications = async (req, res) => {
  try {
    const { vacancyId } = req.params;
    const userId = req.user.id; // Auth middleware-dən
    const { status } = req.query;

    // Vakansiyanı yoxla və sahibini təsdiq et
    const vacancy = await Vacancy.findById(vacancyId);
    
    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vakansiya tapılmadı'
      });
    }

    // Yalnız elan sahibi görə bilər
    if (vacancy.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bu əməliyyatı yerinə yetirmək üçün icazəniz yoxdur'
      });
    }

    // Filter
    const filter = { vacancyId };
    if (status) filter.status = status;

    // Müraciətləri gətir
    const applications = await Application.find(filter)
      .sort({ appliedAt: -1 });

    // Status statistikası
    const counts = {
      pending: await Application.countDocuments({ vacancyId, status: 'pending' }),
      reviewed: await Application.countDocuments({ vacancyId, status: 'reviewed' }),
      accepted: await Application.countDocuments({ vacancyId, status: 'accepted' }),
      rejected: await Application.countDocuments({ vacancyId, status: 'rejected' }),
    };

    // Oxunmamış müraciətləri "oxundu" et
    await Application.updateMany(
      { vacancyId, vacancyOwnerId: userId, isReadByOwner: false },
      { isReadByOwner: true, readAt: new Date() }
    );

    res.json({
      success: true,
      total: applications.length,
      counts,
      applications
    });
  } catch (error) {
    console.error('Get Vacancy Applications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Müraciətlər yüklənmədi',
      error: error.message
    });
  }
};