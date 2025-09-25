
import express from 'express'
import { isAdmin } from '../middleware/isAdmin.js'
import { deleteUser, getAllUsers, getUserById } from '../controllers/adminController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const adminRouter=express.Router()

adminRouter.get('/users',authMiddleware,isAdmin,getAllUsers)
adminRouter.delete('/users/:id',authMiddleware,isAdmin,deleteUser)
adminRouter.get('/users/:id',authMiddleware,isAdmin,getUserById)



export  default adminRouter 