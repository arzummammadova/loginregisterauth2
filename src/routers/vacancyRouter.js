import { approveVacancy, deleteVacancyAll, deleteVacancyById, getVacancy, getVacancyById, getVacancyBySlug, postVacancy, rejectVacancy } from "../controllers/vacancyController.js"
import express from "express"
import authMiddleware from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

const vacancyrouter=express.Router()

vacancyrouter.post('/',authMiddleware,postVacancy)
vacancyrouter.get('/', optionalAuth, getVacancy);

vacancyrouter.patch("/:id/approve", authMiddleware, isAdmin, approveVacancy);
vacancyrouter.patch("/:id/reject", authMiddleware, isAdmin, rejectVacancy);


// Vacancy detail by slug
// vacancyrouter.get('/:slug', getVacancyBySlug);
// vacancyrouter.patch("/:id/approve", authMiddleware, isAdmin, approveVacancy);
// vacancyrouter.patch("/:id/reject", authMiddleware, isAdmin, rejectVacancy);

// vacancyrouter.get('/',authMiddleware,getVacancy)
// vacancyrouter.get('/:id',getVacancyById)

vacancyrouter.delete('/',isAdmin,deleteVacancyAll)
vacancyrouter.delete('/:id',isAdmin,deleteVacancyById)

vacancyrouter.get('/:slug', getVacancyBySlug);

export  default vacancyrouter