import Vacancy from "../models/vacancyModel.js";
import { transporter } from "../utils/mailer.js";
import User from "../models/authModel.js";
import OTP from "../models/otp.js"; // OTP üçün ayrıca model
import crypto from "crypto";
export const getVacancy = async (req, res) => {
  try {
    let query = { isApproved: true }; // default yalnız təsdiqlənmiş vakansiyalar

    if (req.user && req.user.role === "admin") {
      query = {}; // admin hamısını görə bilir
    }

    // Filter by title
    if (req.query.title) {
      query.title = { $regex: req.query.title, $options: "i" }; // case-insensitive search
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Vacancy.countDocuments(query); // ümumi vakansiya sayı
    const vacancies = await Vacancy.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: vacancies,
    });

  } catch (error) {
    console.error("Get vacancy error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
    const { id } = req.params;
    const vacancy = await Vacancy.findById(id);
    if (!vacancy) {
      return res.status(404).json({ message: "Vacancy not found ❌" });
    }

    await vacancy.deleteOne(); // və ya Vacancy.findByIdAndDelete(id)
    return res.status(200).json({ message: "Vacancy deleted ✅" });
  } catch (error) {
    console.error("Delete vacancy error:", error);
    return res.status(500).json({ message: "Server error ❌" });
  }
};
// export const postVacancy = async (req, res) => {
//   try {
//     // Array-ləri və companyInfo-nu parse et (FormData-dan string gəlir)
//     const requirements = req.body.requirements ? JSON.parse(req.body.requirements) : [];
//     const responsibilities = req.body.responsibilities ? JSON.parse(req.body.responsibilities) : [];
//     const benefits = req.body.benefits ? JSON.parse(req.body.benefits) : [];
//     const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
//     const languages = req.body.languages ? JSON.parse(req.body.languages) : [];
//     const companyInfo = req.body.companyInfo ? JSON.parse(req.body.companyInfo) : {};

//     // Boolean dəyərləri düzgün parse et
//     const featured = req.body.featured === 'true';
//     const urgent = req.body.urgent === 'true';

//     const {
//       title,
//       org,
//       deadline,
//       location,
//       category,
//       type,
//       workplace,
//       paymentType,
//       salary,
//       experience,
//       education,
//       description,
//       applicationMethod = "internal",
//       applicationEmail,
//       externalApplicationUrl,
//       contractType,
//       ageRange,
//       metaDescription,
//       eventType,
//     } = req.body;

//     const logo = req.file ? req.file.path : null;

//     // Validation
//     if (!title || !org || !location || !category || !type || !workplace || !paymentType || !experience || !education || !description || !companyInfo?.name || !eventType) {
//       return res.status(400).json({ message: "Zəruri sahələr doldurulmalıdır" });
//     }

//     if (paymentType === "paid" && !salary) {
//       return res.status(400).json({ message: "Ödənişli iş üçün maaş göstərilməlidir" });
//     }

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
//       isApproved: null,
//       applicationMethod,
//       applicationEmail,
//       externalApplicationUrl,
//       contractType,
//       languages,
//       ageRange,
//       eventType,
//       createdBy: req.user?.id || req.user?._id || null,
//     });

//     const savedVacancy = await newVacancy.save();

//     // Admin email göndər
//     try {
//       await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         replyTo: req.user?.email,
//         to: process.env.ADMIN_EMAIL,
//         subject: "Yeni vakansiya əlavə olundu - Təsdiq gözləyir",
//         html: `
//           <h2>Yeni vakansiya təsdiq gözləyir</h2>
//           <p><strong>Başlıq:</strong> ${savedVacancy.title}</p>
//           <p><strong>Şirkət:</strong> ${savedVacancy.org}</p>
//           <p><strong>Kateqoriya:</strong> ${savedVacancy.category}</p>
//           <p><strong>Lokasiya:</strong> ${savedVacancy.location}</p>
//         `,
//       });
//     } catch (err) {
//       console.error("Email error:", err.message);
//     }

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

export const editVacancy = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vacancyni tap
    const vacancy = await Vacancy.findById(id);
    if (!vacancy) return res.status(404).json({ message: "Vacancy tapılmadı ❌" });

    // Authorization: admin və ya yaradan istifadəçi
    if (req.user.role !== "admin" && String(vacancy.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Bu vakansiyanı redaktə etməyə icazəniz yoxdur ❌" });
    }

    // Validation (zəruri sahələr)
    const requiredFields = ["title","org","location","category","type","workplace","paymentType","experience","education","description","companyInfo"];
    for (let field of requiredFields) {
      if (!updateData[field]) return res.status(400).json({ message: `${field} zəruridir` });
    }

    if (updateData.paymentType === "paid" && !updateData.salary) {
      return res.status(400).json({ message: "Ödənişli iş üçün maaş göstərilməlidir" });
    }

    // Slug yeniləyək əgər title dəyişibsə
    if (updateData.title && updateData.title !== vacancy.title) {
      updateData.slug = updateData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    }

    // Update et
    const updatedVacancy = await Vacancy.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json({
      success: true,
      message: "Vakansiya uğurla redaktə olundu ✅",
      data: updatedVacancy
    });

  } catch (error) {
    console.error("Edit vacancy error:", error);
    return res.status(500).json({ message: "Internal server error ❌", error: error.message });
  }
};


export const postVacancy = async (req, res) => {
  try {
    // Array-ləri və companyInfo-nu parse et
    const requirements = req.body.requirements ? JSON.parse(req.body.requirements) : [];
    const responsibilities = req.body.responsibilities ? JSON.parse(req.body.responsibilities) : [];
    const benefits = req.body.benefits ? JSON.parse(req.body.benefits) : [];
    const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    const languages = req.body.languages ? JSON.parse(req.body.languages) : [];
    const companyInfo = req.body.companyInfo ? JSON.parse(req.body.companyInfo) : {};

    const featured = req.body.featured === 'true';
    const urgent = req.body.urgent === 'true';

    const {
      title, org, deadline, location, category, type, workplace,
      paymentType, salary, experience, education, description,
      applicationMethod = "internal", applicationEmail,
      externalApplicationUrl, contractType, ageRange,
      metaDescription, eventType,
    } = req.body;

    const logo = req.file ? req.file.path : null;

    // Validation
    if (!title || !org || !location || !category || !type || !workplace || 
        !paymentType || !experience || !education || !description || 
        !companyInfo?.name || !eventType) {
      return res.status(400).json({ message: "Zəruri sahələr doldurulmalıdır" });
    }

    if (paymentType === "paid" && !salary) {
      return res.status(400).json({ message: "Ödənişli iş üçün maaş göstərilməlidir" });
    }

    // ✅ FIX: Həmişə _id istifadə et
    console.log("🔍 req.user:", req.user); // Debug üçün

    const newVacancy = new Vacancy({
      logo, title, org,
      postedTime: new Date(),
      deadline: deadline ? new Date(deadline) : null,
      location, category, type, workplace, paymentType,
      salary: paymentType === "paid" ? salary : null,
      views: 0,
      applicants: 0,
      featured, urgent, experience, education, description,
      requirements, responsibilities, benefits, tags, companyInfo,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
      metaDescription: metaDescription || description.substring(0, 160),
      status: "active",
      isApproved: null,
      applicationMethod, applicationEmail, externalApplicationUrl,
      contractType, languages, ageRange, eventType,
      createdBy: req.user._id, // ✅ Yalnız _id istifadə et
    });

    const savedVacancy = await newVacancy.save();

    console.log("✅ Vakansiya yaradıldı:", {
      id: savedVacancy._id,
      createdBy: savedVacancy.createdBy,
      title: savedVacancy.title
    });

    // Admin email göndər
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        replyTo: req.user?.email,
        to: process.env.ADMIN_EMAIL,
        subject: "Yeni vakansiya əlavə olundu - Təsdiq gözləyir",
        html: `
          <h2>Yeni vakansiya təsdiq gözləyir</h2>
          <p><strong>Başlıq:</strong> ${savedVacancy.title}</p>
          <p><strong>Şirkət:</strong> ${savedVacancy.org}</p>
          <p><strong>Kateqoriya:</strong> ${savedVacancy.category}</p>
          <p><strong>Lokasiya:</strong> ${savedVacancy.location}</p>
          <p><strong>Yaradan:</strong> ${req.user.username || req.user.email}</p>
        `,
      });
    } catch (err) {
      console.error("Email error:", err.message);
    }

    return res.status(201).json({
      success: true,
      message: "Vakansiya əlavə olundu ✅ (admin təsdiqi gözləyir)",
      data: savedVacancy,
    });
  } catch (error) {
    console.error("Vacancy yaratmaqda xəta:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server xətası", 
      error: error.message 
    });
  }
};


export const getUserVacancies = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ _id istifadə et

    console.log("🔍 İstifadəçi ID:", userId); // Debug

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "İstifadəçi identifikasiyası tapılmadı. Zəhmət olmasa daxil olun." 
      });
    }

    const query = { createdBy: userId };

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Vacancy.countDocuments(query);
    
    console.log("📊 Tapılan vakansiya sayı:", total); // Debug

    const vacancies = await Vacancy.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log("📋 Vakansiyalar:", vacancies.map(v => ({
      id: v._id,
      title: v.title,
      createdBy: v.createdBy,
      isApproved: v.isApproved
    })));

    if (vacancies.length === 0 && page === 1) {
      return res.status(200).json({
        success: true,
        message: "Hələlik heç bir vakansiya əlavə etməmisiniz.",
        data: [],
        page,
        totalPages: 0,
        totalItems: 0,
      });
    }

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: vacancies,
    });

  } catch (error) {
    console.error("getUserVacancies error:", error);
    return res.status(500).json({
      success: false,
      message: "Server xətası, istifadəçi vakansiyalarını ala bilmədi",
      error: error.message,
    });
  }
};

export const requestVacancyDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const vacancy = await Vacancy.findById(id);

    if (!vacancy) {
      return res.status(404).json({ message: "Vakansiya tapılmadı ❌" });
    }

    if (vacancy.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bu vakansiyanı silməyə icazəniz yoxdur ❌" });
    }

    // OTP kod yarat
    const otpCode = crypto.randomInt(100000, 999999); // 6 rəqəmli OTP
    const otpDoc = new OTP({
      userId,
      vacancyId: id,
      otp: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 dəqiqəlik etibarlılıq
    });
    await otpDoc.save();

    // Email göndər
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: "Vakansiya silmə təsdiqi",
      text: `Vakansiyanı silmək üçün OTP kodunuz: ${otpCode}`,
    });

    return res.status(200).json({ message: "OTP kod emailə göndərildi ✅" });

  } catch (error) {
    console.error("requestVacancyDelete error:", error);
    return res.status(500).json({ message: "Server xətası" });
  }
};

export const deleteUserVacancyWithOtp = async (req, res) => {
  try {
    const { id } = req.params; // vakansiya id
    const { otp } = req.body; // istifadəçinin yazdığı otp
    const userId = req.user._id;

    // OTP-ni DB-dən tap
    const otpDoc = await OTP.findOne({
      userId,
      vacancyId: id,
      otp,
      expiresAt: { $gt: Date.now() } // vaxtı keçməsin
    });

    if (!otpDoc) {
      return res.status(400).json({ message: "OTP yanlışdır və ya vaxtı keçib ❌" });
    }

    // Vakansiyanı sil
    const vacancy = await Vacancy.findOneAndDelete({
      _id: id,
      createdBy: userId,
    });

    if (!vacancy) {
      return res.status(404).json({ message: "Vakansiya tapılmadı ❌" });
    }

    // OTP-ni sil (birdəfəlik istifadə üçün)
    await OTP.deleteOne({ _id: otpDoc._id });

    return res.status(200).json({ message: "Vakansiya uğurla silindi ✅" });

  } catch (error) {
    console.error("deleteUserVacancyWithOtp error:", error);
    return res.status(500).json({ message: "Server xətası" });
  }
};


