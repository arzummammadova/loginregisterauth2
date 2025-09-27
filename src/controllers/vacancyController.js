import Vacancy from "../models/vacancyModel.js";
// export const postVacancy = async (req, res) => {
//   try {
//     const {
//       logo,
//       title,
//       org,
//       postedTime,
//       location,
//       category,
//       type,
//       workplace,
//       paymentType,
//       salary,
//       views,
//       applicants,
//       featured,
//     } = req.body;

//     // Yeni vacancy obyekti yarat
//     const newVacancy = new Vacancy({
//       logo,
//       title,
//       org,
//       postedTime, // əgər backend göndərirsə Date kimi gəlməlidir
//       location,
//       category,
//       type,
//       workplace,
//       paymentType,
//       salary,
//       views,
//       applicants,
//       featured,
//     });

//     // DB-yə save et
//     const savedVacancy = await newVacancy.save();

//     return res.status(201).json({
//       message: "Vakansiya uğurla əlavə olundu ✅",
//       vacancy: savedVacancy,
//     });
//   } catch (error) {
//     console.error("Vacancy yaratmaqda xəta:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

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
      // Əsas məlumatlar
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

      // Əlavə məlumatlar
      experience,
      education,
      description,
      requirements = [],
      responsibilities = [],
      benefits = [],
      tags = [],

      // Şirkət məlumatları
      companyInfo,

      // Əlavə parametrlər
      applicationMethod = "internal",
      applicationEmail,
      externalApplicationUrl,
      contractType,
      languages = [],
      ageRange,
      metaDescription,

      // Admin/Creator məlumatları
      createdBy,

      // Lokasiya coordinates (optional)
      coordinates,

      // Status
      status = "active",
      isApproved = false // admin təsdiq etməlidir

    } = req.body;

    // Validation - əsas sahələr
    if (!title || !org || !location || !category || !type || !workplace || !paymentType) {
      return res.status(400).json({
        message: "Zəruri sahələr doldurulmalıdır",
        required: ["title", "org", "location", "category", "type", "workplace", "paymentType"]
      });
    }

    // Validation - paymentType "paid" olarsa salary lazımdır
    if (paymentType === "paid" && !salary) {
      return res.status(400).json({
        message: "Ödənişli iş üçün maaş göstərilməlidir"
      });
    }

    // Validation - experience və education
    if (!experience || !education) {
      return res.status(400).json({
        message: "Təcrübə və təhsil sahələri doldurulmalıdır"
      });
    }

    // Slug yaradırıq (title əsasında)
    let baseSlug = title
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Unique slug təmin etmək üçün timestamp əlavə edək
    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    // Yeni vacancy obyekti yarat
    const newVacancy = new Vacancy({
      // Əsas məlumatlar
      logo,
      title,
      org,
      postedTime: new Date(), // avtomatik current time
      deadline: deadline ? new Date(deadline) : null,
      location,
      category,
      type,
      workplace,
      paymentType,
      salary: paymentType === "paid" ? salary : null,
      views: 0, // başlanğıc dəyər
      applicants: 0, // başlanğıc dəyər
      featured,
      urgent,

      // Əlavə məlumatlar
      experience,
      education,
      description,
      requirements,
      responsibilities,
      benefits,
      tags,

      // Şirkət məlumatları
      companyInfo: {
        name: companyInfo?.name || org, // əgər şirkət adı verilməyibsə org istifadə et
        website: companyInfo?.website,
        phone: companyInfo?.phone,
        email: companyInfo?.email || applicationEmail,
        employees: companyInfo?.employees,
        industry: companyInfo?.industry,
        founded: companyInfo?.founded,
        about: companyInfo?.about
      },

      // SEO və metadata
      slug: uniqueSlug,
      metaDescription: metaDescription || description?.substring(0, 160),

      // Əlaqə məlumatları
      applicationMethod,
      applicationEmail,
      externalApplicationUrl,

      // Əlavə parametrlər
      contractType,
      languages,
      ageRange,
      coordinates,

      // Status və moderasiya
      status,
      isApproved,

      // Yaradıcı məlumatları
      createdBy: createdBy || req.user?.id, // əgər authentication middleware-dan gəlirsə

      // İstatistika sahələri (default dəyərlər)
      clickCount: 0,
      shareCount: 0,
      bookmarkCount: 0
    });

    // DB-yə save et
    const savedVacancy = await newVacancy.save();

    // Populate company info if needed
    const populatedVacancy = await Vacancy.findById(savedVacancy._id)
      .populate('createdBy', 'name email') // user məlumatlarını əlavə et
      .exec();

    return res.status(201).json({
      success: true,
      message: "Vakansiya uğurla əlavə olundu ✅",
      data: {
        vacancy: populatedVacancy,
        slug: uniqueSlug, // frontend-ə slug göndər ki redirect edə bilsin
      }
    });

  } catch (error) {
    console.error("Vacancy yaratmaqda xəta:", error);

    // Mongoose validation xətaları üçün xüsusi handling
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: "Validation xətası",
        errors: validationErrors
      });
    }

    // Duplicate key xətası (məsələn slug)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Bu başlıqla vakansiya artıq mövcuddur",
        error: "Duplicate entry"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server xətası",
      error: error.message
    });
  }
};

// Yardımçı funksiya - vakansiya detayını almaq üçün
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

