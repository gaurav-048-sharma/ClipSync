const Reel = require("../models/reelModel.js");
const User = require("../models/userModel.js");
const Auth = require("../models/authModel.js");

// CREATE: Create a new reel
exports.createReel = async (req, res) => {
    try {
        const { caption } = req.body;
        if (!req.files?.video) {
            return res.status(400).json({ message: "Video file is required" });
        }
        const videoUrl = req.files.video[0].location; // S3 URL from uploadMiddleware

        const user = await User.findOne({ authId: req.user.id });
        if (!user) {
            return res.status(404).json({ message: "User profile not found" });
        }

        const reel = new Reel({
            userId: user._id,
            videoUrl,
            caption,
            views: 0 // Initialize views
        });
        await reel.save();

        res.status(201).json({ message: "Reel created successfully", reel });
    } catch (err) {
        console.error("Create Reel Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// READ: Get a single reel by ID and increment views
exports.getReel = async (req, res) => {
    try {
        const { id } = req.params;
        const reel = await Reel.findById(id)
            .populate("userId", "authId")
            .populate("likes", "authId")
            .populate("comments.userId", "authId");
        if (!reel) {
            return res.status(404).json({ message: "Reel not found" });
        }

        // Increment views
        reel.views += 1;
        await reel.save();

        // Populate nested authId fields
        await reel.populate("userId.authId", "username name");
        await reel.populate("likes.authId", "username name");
        await reel.populate("comments.userId.authId", "username name");

        res.status(200).json(reel);
    } catch (err) {
        console.error("Get Reel Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// READ: Get all reels by a user
exports.getUserReels = async (req, res) => {
    try {
        const { username } = req.params;
        const auth = await Auth.findOne({ username });
        if (!auth) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = await User.findOne({ authId: auth._id });
        if (!user) {
            return res.status(404).json({ message: "User profile not found" });
        }

        const reels = await Reel.find({ userId: user._id })
            .populate("userId", "authId")
            .populate("likes", "authId")
            .populate("comments.userId", "authId")
            .sort({ created_at: -1 });

        await Promise.all(reels.map(reel => 
            reel.populate("userId.authId", "username name")
                .populate("likes.authId", "username name")
                .populate("comments.userId.authId", "username name")
        ));

        res.status(200).json(reels);
    } catch (err) {
        console.error("Get User Reels Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// UPDATE: Update a reel’s caption
exports.updateReel = async (req, res) => {
    try {
        const { id } = req.params;
        const { caption } = req.body;

        const reel = await Reel.findById(id);
        if (!reel) {
            return res.status(404).json({ message: "Reel not found" });
        }

        const user = await User.findOne({ authId: req.user.id });
        if (!user || !reel.userId.equals(user._id)) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (caption !== undefined) reel.caption = caption;
        reel.updated_at = Date.now();
        await reel.save();

        await reel.populate("userId.authId", "username name");
        res.status(200).json({ message: "Reel updated successfully", reel });
    } catch (err) {
        console.error("Update Reel Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// DELETE: Delete a reel
exports.deleteReel = async (req, res) => {
    try {
        const { id } = req.params;
        const reel = await Reel.findById(id);
        if (!reel) {
            return res.status(404).json({ message: "Reel not found" });
        }

        const user = await User.findOne({ authId: req.user.id });
        if (!user || !reel.userId.equals(user._id)) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await reel.deleteOne();
        res.status(200).json({ message: "Reel deleted successfully" });
    } catch (err) {
        console.error("Delete Reel Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// LIKE: Like a reel
exports.likeReel = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ authId: req.user.id });
        const reel = await Reel.findById(id);

        if (!user || !reel) {
            return res.status(404).json({ message: "User or reel not found" });
        }

        if (!reel.likes.includes(user._id)) {
            reel.likes.push(user._id);
            if (!user.likedReels.includes(reel._id)) {
                user.likedReels.push(reel._id);
            }
            await reel.save();
            await user.save();
        }

        await reel.populate("userId.authId", "username name");
        res.status(200).json({ message: "Reel liked successfully", reel });
    } catch (err) {
        console.error("Like Reel Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// COMMENT: Comment on a reel
exports.commentOnReel = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        const user = await User.findOne({ authId: req.user.id });
        const reel = await Reel.findById(id);

        if (!user || !reel) {
            return res.status(404).json({ message: "User or reel not found" });
        }
        if (!text || text.length > 1000) {
            return res.status(400).json({ message: "Comment text is required and must be under 1000 characters" });
        }

        const comment = { userId: user._id, text };
        reel.comments.push(comment);
        if (!user.commentedReels.includes(reel._id)) {
            user.commentedReels.push(reel._id);
        }
        await reel.save();
        await user.save();

        await reel.populate("userId.authId", "username name")
            .populate("comments.userId.authId", "username name");
        res.status(200).json({ message: "Comment added successfully", reel });
    } catch (err) {
        console.error("Comment On Reel Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = {
    createReel: exports.createReel,
    getReel: exports.getReel,
    getUserReels: exports.getUserReels,
    updateReel: exports.updateReel,
    deleteReel: exports.deleteReel,
    likeReel: exports.likeReel,
    commentOnReel: exports.commentOnReel
};