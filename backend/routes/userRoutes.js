const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

module.exports = (wss) => {
    router.post("/", authMiddleware, userController.createUserProfile);
    router.get("/:username", userController.getUserProfile);
    router.get("/", authMiddleware, userController.getOwnProfile);
    
    // Wrap async updateUserProfile in a synchronous callback
    router.put("/", authMiddleware, uploadMiddleware, (req, res, next) => {
        userController.updateUserProfile(wss)(req, res).catch(next);
    });
    
    router.delete("/", authMiddleware, userController.deleteUserProfile);
    router.post("/follow/:username", authMiddleware, userController.followUser);
    router.post("/unfollow/:username", authMiddleware, userController.unfollowUser);
    router.get("/followers/:username", userController.getFollowers);
    router.get("/following/:username", userController.getFollowing);
    router.get("/activity/:username", userController.getUserActivity);
    router.post("/like/:reelId", authMiddleware, userController.likeReel);
    router.post("/comment/:reelId", authMiddleware, userController.commentOnReel);

    return router;
};