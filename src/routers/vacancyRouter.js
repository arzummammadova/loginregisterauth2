import { deleteVacancyAll, deleteVacancyById, getVacancy, getVacancyById, postVacancy } from "../controllers/vacancyController.js"
import express from "express"

const vacancyrouter=express.Router()

vacancyrouter.post('/',postVacancy)
vacancyrouter.get('/',getVacancy)
vacancyrouter.get('/:id',getVacancyById)
vacancyrouter.delete('/',deleteVacancyAll)
vacancyrouter.delete('/:id',deleteVacancyById)
export  default vacancyrouter