
import express from 'express'
import { isAdmin } from '../middleware/isAdmin.js'
import { deleteUser, getAllUsers } from '../controllers/adminController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const adminRouter=express.Router()

adminRouter.get('/users',authMiddleware,isAdmin,getAllUsers)
adminRouter.delete('/users/:id',authMiddleware,isAdmin,deleteUser)



export  default adminRouter 