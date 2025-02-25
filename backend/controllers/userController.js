const User = require("../models/authModel.js")
const UserProfile = require("../models/userModel.js");

exports.createUserProfile = async (req, res) => {
    try {
        const authId = req.user.id; // Usually called internally after signup
        const auth = await User.findById(authId);
        if (!auth) {
            return res.status(404).json({ message: "Auth user not found" });
        }

        const existingUser = await UserProfile.findOne({ authId });
        if (existingUser) {
            return res.status(400).json({ message: "Profile already exists for this user" });
        }

        const user = new UserProfile({ authId });
        await user.save();

        const populatedUser = await UserProfile.findById(user._id).populate("authId", "username name");
        res.status(201).json({ message: "Profile created", user: populatedUser });
    } catch (err) {
        console.error("Create User Profile Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const auth = await User.findOne({ username });
        if (!auth) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = await UserProfile.findOne({ authId: auth._id }).populate("authId", "username name");
        if (!user) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Get User Profile Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// READ: Get Own Profile (authenticated)
exports.getOwnProfile = async (req, res) => {
    try {
        const user = await UserProfile.findOne({ authId: req.user.id }).populate("authId", "username name email");
        if (!user) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error("Get Own Profile Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


// // UPDATE: Update User Profile (authenticated)
// exports.updateUserProfile = async (req, res) => {
//     try {
//         const { bio } = req.body;
//         const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;

//         const user = await UserProfile.findOne({ authId: req.user.id });
//         if (!user) {
//             return res.status(404).json({ message: "Profile not found" });
//         }

//         user.bio = bio || user.bio;
//         if (profilePicture) user.profilePicture = profilePicture;
//         user.updated_at = Date.now();
//         await user.save();

//         const populatedUser = await UserProfile.findById(user._id).populate("authId", "username name");
//         res.status(200).json({ message: "Profile updated", user: populatedUser });
//     } catch (err) {
//         console.error("Update User Profile Error:", err);
//         res.status(500).json({ message: "Server error" });
//     }
// };

// UPDATE: Update user profile (authenticated)
exports.updateUserProfile = async (req, res) => {
    try {
        const { bio } = req.body;
        const profilePicture = req.files?.profilePicture ? req.files.profilePicture[0].location : undefined;

        const user = await UserProfile.findOne({ authId: req.user.id });
        if (!user) {
            return res.status(404).json({ message: "Profile not found" });
        }

        user.bio = bio || user.bio;
        if (profilePicture) user.profilePicture = profilePicture; // S3 URL
        user.updated_at = Date.now();
        await user.save();

        const populatedUser = await UserProfile.findById(user._id).populate("authId", "username name");
        res.status(200).json({ message: "Profile updated", user: populatedUser });
    } catch (err) {
        console.error("Update User Profile Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
// DELETE: Delete User Profile (authenticated)
exports.deleteUserProfile = async (req, res) => {
    try {
        const user = await UserProfile.findOne({ authId: req.user.id });
        if (!user) {
            return res.status(404).json({ message: "Profile not found" });
        }

        await user.deleteOne();
        res.status(200).json({ message: "Profile deleted" });
    } catch (err) {
        console.error("Delete User Profile Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createUserProfile: exports.createUserProfile,
    getUserProfile: exports.getUserProfile,
    getOwnProfile: exports.getOwnProfile,
    updateUserProfile: exports.updateUserProfile,
    deleteUserProfile: exports.deleteUserProfile
};
