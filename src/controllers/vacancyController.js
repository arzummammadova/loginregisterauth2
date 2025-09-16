

import Vacancy from '../models/vacancyModel.js'
export const postVacancy = async (req, res) => {
  try {
    const {
      logo,
      title,
      org,
      postedTime,
      location,
      category,
      type,
      workplace,
      paymentType,
      salary,
      views,
      applicants,
      featured,
    } = req.body;

    // Yeni vacancy obyekti yarat
    const newVacancy = new Vacancy({
      logo,
      title,
      org,
      postedTime, // əgər backend göndərirsə Date kimi gəlməlidir
      location,
      category,
      type,
      workplace,
      paymentType,
      salary,
      views,
      applicants,
      featured,
    });

    // DB-yə save et
    const savedVacancy = await newVacancy.save();

    return res.status(201).json({
      message: "Vakansiya uğurla əlavə olundu ✅",
      vacancy: savedVacancy,
    });
  } catch (error) {
    console.error("Vacancy yaratmaqda xəta:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getVacancy=async(req,res)=>{
    try {
         const vacancies = await Vacancy.find().sort({ createdAt: -1 }); 
    return res.status(200).json(vacancies);
        
    } catch (error) {
        return res.status(500).json({message:"internal server error",error:error.message})
        
    }
}