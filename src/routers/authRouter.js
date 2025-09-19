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

import authMiddleware from "../middleware/authMiddleware.js"; 

const router = express.Router();
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Yeni istifadəçi qeydiyyatı
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: arzu
 *               email:
 *                 type: string
 *                 format: email
 *                 example: arzu@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: myStrongPassword123@
 *     responses:
 *       201:
 *         description: User created. Email verification sent.
 *         content:
 *           application/json:
 *             example:
 *               message: "User created. Please verify your email"
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             example:
 *               message: "User already exists"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Server error"
 */
router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);

// Yeni 'me' endpointi
router.get("/me", authMiddleware, (req, res) => {
    // authMiddleware-i keçdikdən sonra req.user obyekti mövcud olacaq
    return res.status(200).json({
      message: "Authorized",
      user: req.user,
    });
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
router.post("/reset-password", resetPassword);
export default router;
