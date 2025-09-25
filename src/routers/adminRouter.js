
import express from 'express'
import { isAdmin } from '../middleware/isAdmin.js'
import { getAllUsers } from '../controllers/adminController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const adminRouter=express.Router()

adminRouter.get('/users',authMiddleware,isAdmin,getAllUsers)



export  default adminRouter 