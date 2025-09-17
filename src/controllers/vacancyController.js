import Vacancy from "../models/vacancyModel.js";
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

export const deleteVacancyById=async(req,res)=>{
  try {
    const {id}=req.params
    const deletedVacancy=await Vacancy.findByIdAndDelete(id)
    if(!deletedVacancy){
     return res.status(404).json({message:"cannot find vacancy"})
    }
    return res.status(200).json({message:"deleted successfully"})
    
  } catch (error) {
    return res.status(500).json({message:"internal serve error",error:error.message})
    
  }
 
}
