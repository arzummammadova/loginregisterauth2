import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// CV upload storage
const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cv_pdf",
    allowed_formats: ["pdf", "doc", "docx"],
    resource_type: "raw",
  },
});

// Vacancy logos storage
const vacancyLogoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "vacancy_logos",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

// USER PROFILE IMAGE STORAGE - BU ƏLAVƏDİR!
const userProfileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_profiles",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  },
});

export const upload = multer({ storage: vacancyLogoStorage });
export const uploadCV = multer({ 
  storage: cvStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});
export const uploadUserProfile = multer({ 
  storage: userProfileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});