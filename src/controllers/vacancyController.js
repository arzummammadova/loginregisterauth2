import Vacancy from "../models/vacancyModel.js";
import { transporter } from "../utils/mailer.js";

export const getVacancy = async (req, res) => {
  try {
    const vacancies = await Vacancy.find().sort({ createdAt: -1 });
    return res.status(200).json(vacancies);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "internal server error", error: error.message });
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
      isApproved: false, // production üçün false
      applicationMethod,
      applicationEmail,
      externalApplicationUrl,
      contractType,
      languages,
      ageRange,
      eventType,
      createdBy: req.user?.id || null
    });

    const savedVacancy = await newVacancy.save();

    // Admin email göndər
  await transporter.sendMail({
  from: process.env.EMAIL_USER,     // sənin Gmail hesabın olmalıdır
  replyTo: req.user.email,          // istifadəçi emaili burada
  to: process.env.ADMIN_EMAIL,      // admin email
  subject: "Yeni vakansiya əlavə olundu - Təsdiq gözləyir",
  html: `
    <h2>Yeni vakansiya əlavə edildi</h2>
    <p><b>Başlıq:</b> ${savedVacancy.title}</p>
    <p><b>Şirkət:</b> ${savedVacancy.org}</p>
    <p><b>Kateqoriya:</b> ${savedVacancy.category}</p>
    <p><b>Lokasiya:</b> ${savedVacancy.location}</p>
    <br/>
    <p>Zəhmət olmasa admin paneldən təsdiqlə.</p>
  `,
});


    return res.status(201).json({
      success: true,
      message: "Vakansiya əlavə olundu ✅ (admin təsdiqi gözləyir)",
      data: savedVacancy,
    });
  } catch (error) {
    console.error("Vacancy yaratmaqda xəta:", error);
    return res.status(500).json({ success: false, message: "Server xətası", error: error.message });
  }
};
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

