import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cvStorage=new CloudinaryStorage({
  cloudinary,
  params:{folder:"cv_pdf",
  allowed_formats:["pdf","dosc","doc"]},
  resource_type: "raw", // PDF və digər fayllar üçün


})
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "vacancy_logos", // şəkillər bu folderdə saxlanacaq
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

export const upload = multer({ storage });
export const uploadCV = multer({ 
  storage: cvStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
