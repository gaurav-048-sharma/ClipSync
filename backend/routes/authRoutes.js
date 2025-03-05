const express = require("express");
const router = express.Router();
const passport = require('passport');
const authController = require("../controllers/authController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const checkBlacklist = require("../middleware/checkBlacklist.js");

// Initialize Passport
require('../config/passport.js');

// Google Auth Routes (Passport-based)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }), 
    (req, res) => {
        const token = req.user.token;
        res.redirect(`/dashboard?token=${token}`);
    }
);
// Microsoft Auth Routes (Passport-based)
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));
router.get('/microsoft/callback', 
  passport.authenticate('microsoft', { failureRedirect: '/login' }), 
  authController.microsoftCallback
);
// Standard Auth Routes
router.post("/signup", authController.signup);
router.get('/all', authController.getAllUsers);
router.get("/user/:username", authController.getUser);
router.get('/userById/:id',authMiddleware, authController.getUserById);
router.get("/profile", authMiddleware, authController.getOwnProfile);
router.put("/profile", authMiddleware, authController.updateProfile);
router.delete("/profile", authMiddleware, authController.deleteAccount);
router.post("/login", authController.login);
router.post("/google-login", authController.googleLogin); // New API endpoint
router.post('/microsoft-login', authController.microsoftLogin);
router.post("/logout", checkBlacklist, authController.logout);

module.exports = router;