import { approveVacancy, deleteVacancyAll, deleteVacancyById, getVacancy, getVacancyById, getVacancyBySlug, postVacancy } from "../controllers/vacancyController.js"
import express from "express"
import authMiddleware from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const vacancyrouter=express.Router()
/**
 * @swagger
 * /vacancy:
 *   get:
 *     summary: Get all vacancies
 *     responses:
 *       200:
 *         description: List of vacancies
 */

vacancyrouter.post('/',authMiddleware,postVacancy)
// Vacancy detail by slug
vacancyrouter.get('/:slug', getVacancyBySlug);
vacancyrouter.patch("/:id/approve", authMiddleware, isAdmin, approveVacancy);
vacancyrouter.get('/',getVacancy)
// vacancyrouter.get('/:id',getVacancyById)

vacancyrouter.delete('/',isAdmin,deleteVacancyAll)
vacancyrouter.delete('/:id',isAdmin,deleteVacancyById)
export  default vacancyrouter