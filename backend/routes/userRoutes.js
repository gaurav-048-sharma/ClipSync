// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const uploadMiddleware = require("../middleware/uploadMiddleware.js");

// router.post("/", authMiddleware, userController.createUserProfile);
// router.get("/", authMiddleware, userController.getOwnProfile);
// router.put("/", authMiddleware, uploadMiddleware, userController.updateUserProfile);
// router.delete("/", authMiddleware, userController.deleteUserProfile);
// router.get("/:username", userController.getUserProfile); // Public, no authMiddleware

router.post("/", authMiddleware, userController.createUserProfile);
router.get("/:username", userController.getUserProfile);
router.get("/", authMiddleware, userController.getOwnProfile);
router.put("/", authMiddleware, uploadMiddleware, userController.updateUserProfile);
router.delete("/", authMiddleware, userController.deleteUserProfile);

module.exports = router;