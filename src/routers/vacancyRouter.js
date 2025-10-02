import { approveVacancy,  deleteUserVacancyWithOtp,  deleteVacancyAll, deleteVacancyById, editVacancy, getUserVacancies, getVacancy, getVacancyById, getVacancyBySlug, postVacancy, rejectVacancy, requestVacancyDelete } from "../controllers/vacancyController.js"
import express from "express"
import authMiddleware from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { upload } from "../config/cloudinary.js";
const vacancyrouter=express.Router()
// vacancyrouter.post('/',authMiddleware,postVacancy)
vacancyrouter.post("/", authMiddleware, upload.single("logo"), postVacancy);

vacancyrouter.get('/', optionalAuth, getVacancy);
vacancyrouter.patch("/:id/approve", authMiddleware, isAdmin, approveVacancy);
vacancyrouter.patch("/:id/reject", authMiddleware, isAdmin, rejectVacancy);
// Vacancy detail by slug
// vacancyrouter.get('/:slug', getVacancyBySlug);
// vacancyrouter.patch("/:id/approve", authMiddleware, isAdmin, approveVacancy);
// vacancyrouter.patch("/:id/reject", authMiddleware, isAdmin, rejectVacancy);
// vacancyrouter.get('/',authMiddleware,getVacancy)
vacancyrouter.get('/id/:id',getVacancyById)
vacancyrouter.delete('/',isAdmin,deleteVacancyAll)
vacancyrouter.delete('/:id',authMiddleware,isAdmin,deleteVacancyById)
vacancyrouter.put('/:id', authMiddleware, editVacancy); 

vacancyrouter.get("/user/user", authMiddleware, getUserVacancies);
vacancyrouter.get('/:slug', getVacancyBySlug);


// Vakansiya silmək üçün OTP istəyi göndərilir
vacancyrouter.post('/:id/request-delete', authMiddleware, requestVacancyDelete);

// OTP ilə təsdiq edildikdən sonra silinir
vacancyrouter.post('/:id/confirm-delete', authMiddleware, deleteUserVacancyWithOtp);

export  default vacancyrouter