import {
    forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  setPassword,
  verifyEmail,
} from "../controllers/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import express from "express";
import User from "../models/authModel.js";


import authMiddleware from "../middleware/authMiddleware.js"; 
import { upload } from "../config/cloudinary.js";

const router = express.Router();
router.post("/register", register);
router.get("/verify-email", verifyEmail);

router.post("/login", login);
router.post("/logout", logout);
const debugCookies = (req, res, next) => {
  
  next();
};

router.use('/me', debugCookies);


router.get("/me", authMiddleware, async (req, res) => {
  try {
    // authMiddleware-dən gələn id
    const user = await User.findById(req.user.id).select("-password"); 
    // -password yazmaqla şifrəni göndərmirik

    if (!user) {
      return res.status(404).json({ message: "İstifadəçi tapılmadı" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("ME endpoint error:", error);
    return res.status(500).json({ message: "Server xətası" });
  }
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Google callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" ,session:false}),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(process.env.CLIENT_URL); // frontend-ə yönləndir
  }
);


router.post("/set-password", setPassword);


router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", resetPassword);
router.post("/reset-password/:id/:token", resetPassword);

router.put(
  "/edit-profile",
  authMiddleware,
  upload.single("userImage"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const updates = { ...req.body };

      if ("email" in updates) delete updates.email;

      // Multer və ya Cloudinary faylı düzgün gəlirsə
      if (req.file && req.file.path) {
        updates.userImage = String(req.file.path);
      } else {
        delete updates.userImage; // boş obyekt göndərməmək üçün
      }

      // Obyektləri sil
      Object.keys(updates).forEach(key => {
        if (typeof updates[key] === "object" && !Array.isArray(updates[key])) {
          delete updates[key];
        }
      });

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      Object.keys(updates).forEach(update => {
        user[update] = updates[update];
      });

      await user.save();

      res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
  }
);
















export default router;


