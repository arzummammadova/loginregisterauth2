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
import { uploadUserProfile } from "../config/multer.js";

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
  uploadUserProfile.single("userImage"), // uploadUserProfile istifadə edin
  async (req, res) => {
    try {
      console.log("=== EDIT PROFILE REQUEST ===");
      console.log("User ID:", req.user?.id);
      console.log("req.body:", JSON.stringify(req.body, null, 2));
      console.log("req.file:", req.file);
      console.log("========================");

      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Find user first
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update fields manually (safest approach)
      if (req.body.username) {
        const username = String(req.body.username).trim();
        if (username) user.username = username;
      }
      
      if (req.body.bio !== undefined) {
        user.bio = String(req.body.bio || '').trim();
      }
      
      if (req.body.userLocation) {
        const location = String(req.body.userLocation).trim();
        if (location) user.userLocation = location;
      }

      if (req.file?.path) {
        user.userImage = String(req.file.path);
      }

      // Save the user
      await user.save();

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;

      console.log("✅ Profile updated successfully");

      res.status(200).json({ 
        message: "Profile updated successfully", 
        user: userResponse
      });

    } catch (error) {
      console.error("❌ Edit profile error:", error.message);
      console.error("Stack:", error.stack);
      
      res.status(500).json({ 
        message: "Failed to update profile", 
        error: error.message
      });
    }
  }
);















export default router;


