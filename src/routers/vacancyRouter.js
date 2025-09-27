import { deleteVacancyAll, deleteVacancyById, getVacancy, getVacancyById, getVacancyBySlug, postVacancy } from "../controllers/vacancyController.js"
import express from "express"

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

vacancyrouter.post('/',postVacancy)
// Vacancy detail by slug
vacancyrouter.get('/:slug', getVacancyBySlug);



vacancyrouter.get('/',getVacancy)
vacancyrouter.get('/:id',getVacancyById)

vacancyrouter.delete('/',deleteVacancyAll)
vacancyrouter.delete('/:id',deleteVacancyById)
export  default vacancyrouter