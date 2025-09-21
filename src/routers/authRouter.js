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
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user with username/email and password. Handles Google accounts without passwords and account lock logic.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - password
 *             properties:
 *               user:
 *                 type: string
 *                 description: Username or email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64f8e1d3c2b3a4567d8f9e12
 *                     username:
 *                       type: string
 *                       example: john_doe
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     role:
 *                       type: string
 *                       example: user
 *       400:
 *         description: Validation error or incorrect credentials / Google account without password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: İstifadəçi tapılmadı
 *       403:
 *         description: Account temporarily locked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hesabınız müvəqqəti bloklanıb. Zəhmət olmasa 15 dəqiqə sonra yenidən cəhd edin.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server xətası
 *                 error:
 *                   type: string
 *                   example: Error details
 */

router.post("/login", login);
router.post("/logout", logout);
const debugCookies = (req, res, next) => {
  console.log('🍪 Cookies received:', req.cookies);
  console.log('📱 User-Agent:', req.headers['user-agent']);
  console.log('🌍 Origin:', req.headers.origin);
  next();
};

router.use('/me', debugCookies);
// Yeni 'me' endpointi
router.get("/me", authMiddleware, (req, res) => {
    // authMiddleware-i keçdikdən sonra req.user obyekti mövcud olacaq
    return res.status(200).json({
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
