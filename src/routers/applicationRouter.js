import express from 'express';
import { uploadCV } from '../config/cloudinary.js';
import { 
  applyVacancy, 
  getMyApplications, 
  updateApplicationStatus 
} from '../controllers/applicationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const applicationRouter = express.Router();
// Public - Müraciət göndərmək (CV ilə)
applicationRouter.post('/apply', uploadCV.single('cv'), applyVacancy);

// Protected - Elan sahibinin müraciətlərini görmək
applicationRouter.get('/my-applications', authMiddleware, getMyApplications);

// Protected - Müraciət statusunu yeniləmək
applicationRouter.patch('/:id/status',authMiddleware, updateApplicationStatus);

export default applicationRouter;