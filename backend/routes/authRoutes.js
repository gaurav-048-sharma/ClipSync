const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");
const checkBlacklist = require("../middleware/checkBlacklist.js")

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", checkBlacklist, authController.logout);

module.exports = router;