// const express = require("express");
// const router = express.Router();
// const profileController = require("../controllers/profileController.js");
// const authMiddleware = require("../middleware/authMiddleware.js");
// const uploadMiddleware = require("../middleware/uploadMiddleware.js");

// // Reel Routes
// router.post("/reels", authMiddleware, uploadMiddleware, profileController.createReel); // Create a reel
// router.get("/reels/:id", profileController.getReel); // Get a single reel
// router.get("/reels/user/:username", profileController.getUserReels); // Get all reels by a user
// router.put("/reels/:id", authMiddleware, profileController.updateReel); // Update reel caption
// router.delete("/reels/:id", authMiddleware, profileController.deleteReel); // Delete a reel
// router.post("/reels/like/:id", authMiddleware, profileController.likeReel); // Like a reel
// router.post("/reels/comment/:id", authMiddleware, profileController.commentOnReel); // Comment on a reel

// module.exports = router;
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

// Reel CRUD Routes
router.post("/reels", authMiddleware, uploadMiddleware, profileController.createReel); // Create
router.get("/reels/:id", profileController.getReel); // Read single reel (increments views)
router.get("/reels/user/:username", profileController.getUserReels); // Read all user reels
router.put("/reels/:id", authMiddleware, profileController.updateReel); // Update
router.delete("/reels/:id", authMiddleware, profileController.deleteReel); // Delete

// Reel Interaction Routes
router.post("/reels/like/:id", authMiddleware, profileController.likeReel); // Like a reel
router.post("/reels/comment/:id", authMiddleware, profileController.commentOnReel); // Comment on a reel

module.exports = router;