import Vacancy from "../models/vacancyModel.js";
import { transporter } from "../utils/mailer.js";
import User from "../models/authModel.js";
export const getVacancy = async (req, res) => {
  try {
    let query = { isApproved: true }; // default olaraq yalnız təsdiqlənmişləri göstər

    if (req.user && req.user.role === "admin") {
      query = {}; // admin hamısını görür
    }

    const vacancies = await Vacancy.find(query).sort({ createdAt: -1 });
    return res.status(200).json(vacancies);
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};


export const getVacancyById = async (req, res) => {
  try {
    const { id } = req.params;
    const vacancy = await Vacancy.findById(id);

    if (!vacancy) {
      return res.status(404).json({ message: "Vacancy not found ❌" });
    }

    return res.status(200).json(vacancy);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteVacancyAll = async (req, res) => {
  try {
    const result = await Vacancy.deleteMany();
    return res.status(200).json({
      message: "deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

export const deleteVacancyById = async (req, res) => {
  try {
    const { id } = req.params
    const deletedVacancy = await Vacancy.findByIdAndDelete(id)
    if (!deletedVacancy) {
      return res.status(404).json({ message: "cannot find vacancy" })
    }
    return res.status(200).json({ message: "deleted successfully" })

  } catch (error) {
    return res.status(500).json({ message: "internal serve error", error: error.message })

  }

}
export const postVacancy = async (req, res) => {
  try {
    const {
      logo,
      title,
      org,
      deadline,
      location,
      category,
      type,
      workplace,
      paymentType,
      salary,
      featured = false,
      urgent = false,
      experience,
      education,
      description,
      requirements = [],
      responsibilities = [],
      benefits = [],
      tags = [],
      companyInfo,
      applicationMethod = "internal",
      applicationEmail,
      externalApplicationUrl,
      contractType,
      languages = [],
      ageRange,
      metaDescription,
      eventType,
    } = req.body;

    // Əsas validation
    if (!title || !org || !location || !category || !type || !workplace || !paymentType || !experience || !education || !description || !companyInfo?.name || !eventType) {
      return res.status(400).json({ message: "Zəruri sahələr doldurulmalıdır" });
    }

    if (paymentType === "paid" && !salary) {
      return res.status(400).json({ message: "Ödənişli iş üçün maaş göstərilməlidir" });
    }

    console.log("📝 Creating vacancy...");
    console.log("👤 User from req:", req.user);

    // Yeni vacancy yaradılır
    const newVacancy = new Vacancy({
      logo,
      title,
      org,
      postedTime: new Date(),
      deadline: deadline ? new Date(deadline) : null,
      location,
      category,
      type,
      workplace,
      paymentType,
      salary: paymentType === "paid" ? salary : null,
      views: 0,
      applicants: 0,
      featured,
      urgent,
      experience,
      education,
      description,
      requirements,
      responsibilities,
      benefits,
      tags,
      companyInfo,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
      metaDescription: metaDescription || description.substring(0, 160),
      status: "active",
      isApproved: null,
      applicationMethod,
      applicationEmail,
      externalApplicationUrl,
      contractType,
      languages,
      ageRange,
      eventType,
      
      // ✅ DÜZƏLDILMIŞ: User ObjectId-ni düzgün saxlayırıq
      createdBy: req.user?.id || req.user?._id || null, // ObjectId kimi
    });

    const savedVacancy = await newVacancy.save();

    console.log("✅ Vacancy saved with createdBy:", savedVacancy.createdBy);

    // Admin email göndər
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        replyTo: req.user?.email,
        to: process.env.ADMIN_EMAIL,
        subject: "Yeni vakansiya əlavə olundu - Təsdiq gözləyir",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">📋 Yeni Vakansiya</h1>
            </div>
            <div style="background: white; padding: 30px;">
              <h2 style="color: #333;">Yeni vakansiya təsdiq gözləyir</h2>
              <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p><strong>Başlıq:</strong> ${savedVacancy.title}</p>
                <p><strong>Şirkət:</strong> ${savedVacancy.org}</p>
                <p><strong>Kateqoriya:</strong> ${savedVacancy.category}</p>
                <p><strong>Lokasiya:</strong> ${savedVacancy.location}</p>
                <p><strong>Yaradıcı:</strong> ${req.user?.name || req.user?.username || 'Anonim'}</p>
              </div>
              <p style="color: #666;">
                Zəhmət olmasa admin paneldən vakansiyanı təsdiqlə.
              </p>
            </div>
          </div>
        `,
      });

      console.log("✅ Admin email sent");
    } catch (emailError) {
      console.error("❌ Admin email error:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Vakansiya əlavə olundu ✅ (admin təsdiqi gözləyir)",
      data: savedVacancy,
    });
  } catch (error) {
    console.error("💥 Vacancy yaratmaqda xəta:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server xətası", 
      error: error.message 
    });
  }
};

// export const postVacancy = async (req, res) => {
//   try {
//     const {
//       logo,
//       title,
//       org,
//       deadline,
//       location,
//       category,
//       type,
//       workplace,
//       paymentType,
//       salary,
//       featured = false,
//       urgent = false,
//       experience,
//       education,
//       description,
//       requirements = [],
//       responsibilities = [],
//       benefits = [],
//       tags = [],
//       companyInfo,
//       applicationMethod = "internal",
//       applicationEmail,
//       externalApplicationUrl,
//       contractType,
//       languages = [],
//       ageRange,
//       metaDescription,
//       eventType,
//     } = req.body;

//     // Əsas validation
//     if (!title || !org || !location || !category || !type || !workplace || !paymentType || !experience || !education || !description || !companyInfo?.name || !eventType) {
//       return res.status(400).json({ message: "Zəruri sahələr doldurulmalıdır" });
//     }

//     if (paymentType === "paid" && !salary) {
//       return res.status(400).json({ message: "Ödənişli iş üçün maaş göstərilməlidir" });
//     }

//     // Yeni vacancy yaradılır
//     const newVacancy = new Vacancy({
//       logo,
//       title,
//       org,
//       postedTime: new Date(),
//       deadline: deadline ? new Date(deadline) : null,
//       location,
//       category,
//       type,
//       workplace,
//       paymentType,
//       salary: paymentType === "paid" ? salary : null,
//       views: 0,
//       applicants: 0,
//       featured,
//       urgent,
//       experience,
//       education,
//       description,
//       requirements,
//       responsibilities,
//       benefits,
//       tags,
//       companyInfo,
//       slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
//       metaDescription: metaDescription || description.substring(0, 160),
//       status: "active",
//       isApproved: false, // production üçün false
//       applicationMethod,
//       applicationEmail,
//       externalApplicationUrl,
//       contractType,
//       languages,
//       ageRange,
//       eventType,
//       createdBy: req.user?.id || null
//     });

//     const savedVacancy = await newVacancy.save();

//     // Admin email göndər
//   await transporter.sendMail({
//   from: process.env.EMAIL_USER,     // sənin Gmail hesabın olmalıdır
//   replyTo: req.user.email,          // istifadəçi emaili burada
//   to: process.env.ADMIN_EMAIL,      // admin email
//   subject: "Yeni vakansiya əlavə olundu - Təsdiq gözləyir",
//   html: `
//     <h2>Yeni vakansiya əlavə edildi</h2>
//     <p><b>Başlıq:</b> ${savedVacancy.title}</p>
//     <p><b>Şirkət:</b> ${savedVacancy.org}</p>
//     <p><b>Kateqoriya:</b> ${savedVacancy.category}</p>
//     <p><b>Lokasiya:</b> ${savedVacancy.location}</p>
//     <br/>
//     <p>Zəhmət olmasa admin paneldən təsdiqlə.</p>
//   `,
// });


//     return res.status(201).json({
//       success: true,
//       message: "Vakansiya əlavə olundu ✅ (admin təsdiqi gözləyir)",
//       data: savedVacancy,
//     });
//   } catch (error) {
//     console.error("Vacancy yaratmaqda xəta:", error);
//     return res.status(500).json({ success: false, message: "Server xətası", error: error.message });
//   }
// };
// controller
export const approveVacancy = async (req, res) => {
  try {
    const { id } = req.params;

    const vacancy = await Vacancy.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!vacancy) return res.status(404).json({ message: "Vakansiya tapılmadı ❌" });

    return res.status(200).json({ success: true, message: "Vakansiya təsdiq olundu ✅", data: vacancy });
  } catch (error) {
    console.error("approveVacancy error:", error);
    return res.status(500).json({ success: false, message: "Server xətası", error: error.message });
  }
};

export const getVacancyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const vacancy = await Vacancy.findOne({ slug })
      .populate('createdBy', 'name email')
      .populate('relatedJobs', 'title org salary slug')
      .exec();

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: "Vakansiya tapılmadı"
      });
    }

    // Views sayını artır (asynchronous)
    vacancy.incrementViews().catch(console.error);

    return res.status(200).json({
      success: true,
      data: { vacancy }
    });

  } catch (error) {
    console.error("Vakansiya məlumatlarını almaqda xəta:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası",
      error: error.message
    });
  }
};

// vacancyController.js - debug version

export const rejectVacancy = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("🔴 REJECT BAŞLADI - ID:", id);

    // 1. Vakansiyanı tap və statusu yenilə (populate ilə user məlumatlarını da al)
    const updatedVacancy = await Vacancy.findByIdAndUpdate(
      id,
      { isApproved: false },
      { new: true }
    ).populate('createdBy', 'name email username'); // ✅ Populate işləyəcək

    if (!updatedVacancy) {
      console.log("❌ Vakansiya tapılmadı");
      return res.status(404).json({ message: "Vakansiya tapılmadı ❌" });
    }

    console.log("📝 Vakansiya tapıldı və yeniləndi:", updatedVacancy.title);
    console.log("👤 Created by user:", updatedVacancy.createdBy);

    // 2. Email göndər
    let emailSent = false;
    if (updatedVacancy.createdBy && updatedVacancy.createdBy.email) {
      try {
        console.log("📧 Email göndərilir:", updatedVacancy.createdBy.email);
        
        const emailResult = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: updatedVacancy.createdBy.email,
          subject: "Vakansiyanız imtina olundu ❌",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚠️ Vakansiya İmtinası</h1>
              </div>
              <div style="background: white; padding: 30px;">
                <h2 style="color: #333;">Salam ${updatedVacancy.createdBy.name || 'İstifadəçi'},</h2>
                <p style="color: #666;">Təəssüf ki, göndərdiyiniz vakansiya imtina edilmişdir:</p>
                
                <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p><strong>📋 Başlıq:</strong> ${updatedVacancy.title}</p>
                  <p><strong>🏢 Şirkət:</strong> ${updatedVacancy.org}</p>
                  <p><strong>📂 Kateqoriya:</strong> ${updatedVacancy.category}</p>
                  <p><strong>📍 Lokasiya:</strong> ${updatedVacancy.location}</p>
                  <p><strong>📅 Tarix:</strong> ${new Date(updatedVacancy.createdAt).toLocaleDateString('az-AZ')}</p>
                </div>
                
                <div style="background: #e6fffa; border: 1px solid #81e6d9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #234e52; margin: 0 0 10px 0;">💡 Nə edə bilərsiniz?</h3>
                  <p style="color: #2c7a7b; margin: 0;">
                    Məlumatları yenidən yoxlayıb düzəliş etdikdən sonra yenidən göndərə bilərsiniz.
                  </p>
                </div>
              </div>
              <div style="background: #2d3748; padding: 20px; text-align: center;">
                <p style="color: #a0aec0; margin: 0;">© 2024 Vakansiya Platforması</p>
              </div>
            </div>
          `,
        });

        console.log("✅ Email göndərildi:", emailResult.messageId);
        emailSent = true;
        
      } catch (emailError) {
        console.error("❌ Email xətası:", emailError.message);
      }
    } else {
      console.log("❌ User məlumatları və ya email tapılmadı");
    }

    console.log("🏁 REJECT TAMAMLANDI");

    return res.status(200).json({
      success: true,
      message: emailSent 
        ? "Vakansiya imtina olundu ❌ (Email göndərildi)" 
        : "Vakansiya imtina olundu ❌ (Email göndərilə bilmədi)",
      data: updatedVacancy,
      emailSent,
    });

  } catch (error) {
    console.error("💥 REJECT XƏTASI:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası",
      error: error.message,
    });
  }
};
