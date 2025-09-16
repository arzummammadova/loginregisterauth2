import { getVacancy, postVacancy } from "../controllers/vacancyController.js"
import express from "express"

const vacancyrouter=express.Router()

vacancyrouter.post('/',postVacancy)
vacancyrouter.get('/',getVacancy)

export  default vacancyrouter