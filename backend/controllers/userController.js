const User = require("../models/authModel.js")
const UserProfile = require("../models/userModel.js");
const Reel = require("../models/reelModel.js")
//const { wss } = require("../server");

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


exports.updateUserProfile = (wss) => async (req, res) => {
    try {
        const { bio, username, name } = req.body;
        const profilePicture = req.files && req.files?.length > 0 ? req.files[0].location : undefined; // Use first file

        const user = await UserProfile.findOne({ authId: req.user.id });
        if (!user) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const auth = await User.findById(req.user.id);
        if (!auth) {
            return res.status(404).json({ message: "Authentication record not found" });
        }

        if (bio !== undefined) user.bio = bio;
        if (profilePicture) user.profilePicture = profilePicture;
        user.updated_at = Date.now();

        if (username !== undefined) {
            if (username.length < 3 || username.length > 30) {
                return res.status(400).json({ message: "Username must be 3-30 characters" });
            }
            const existingUser = await User.findOne({ username });
            if (existingUser && existingUser._id.toString() !== auth._id.toString()) {
                return res.status(400).json({ message: "Username already taken" });
            }
            auth.username = username;
        }
        if (name !== undefined) auth.name = name;
        auth.updated_at = Date.now();

        await user.save();
        await auth.save();

        const populatedUser = await UserProfile.findById(user._id).populate("authId", "username name");

        // Notify followers via WebSocket with error handling
        if (wss && wss.clients) {
            const notification = JSON.stringify({ message: "Profile updated", user: populatedUser });
            try {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(notification);
                    }
                });
            } catch (wsErr) {
                console.error("WebSocket Notification Error:", wsErr);
            }
        } else {
            console.warn("WebSocket server (wss) not available");
        }

        if (!res.headersSent) {
            res.status(200).json({ message: "Profile updated successfully", user: populatedUser });
        }
    } catch (err) {
        //console.error("Update User Profile Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server error", error: err.message });
        }
    }
};

// UPDATE: Update user profile (authenticated)
// exports.updateUserProfile = async (req, res) => {
//     try {
//         const { bio } = req.body;
//         const profilePicture = req.files?.profilePicture ? req.files.profilePicture[0].location : undefined;

//         const user = await UserProfile.findOne({ authId: req.user.id });
//         if (!user) {
//             return res.status(404).json({ message: "Profile not found" });
//         }

//         user.bio = bio || user.bio;
//         if (profilePicture) user.profilePicture = profilePicture; // S3 URL
//         user.updated_at = Date.now();
//         await user.save();

//         const populatedUser = await UserProfile.findById(user._id).populate("authId", "username name");
//         res.status(200).json({ message: "Profile updated", user: populatedUser });
//     } catch (err) {
//         console.error("Update User Profile Error:", err);
//         res.status(500).json({ message: "Server error" });
//     }
// };
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
// Follow a user
exports.followUser = async (req, res) => {
    try {
      const follower = await UserProfile.findOne({ authId: req.user.id });
      const targetUsername = req.params.username;
      const targetAuth = await User.findOne({ username: targetUsername });
      if (!targetAuth) return res.status(404).json({ message: 'User not found' });
  
      const target = await UserProfile.findOne({ authId: targetAuth._id });
      if (!target) return res.status(404).json({ message: 'User profile not found' });
  
      if (follower._id.equals(target._id)) return res.status(400).json({ message: 'Cannot follow yourself' });
  
      if (!follower.following.includes(target._id)) {
        follower.following.push(target._id);
        target.followers.push(follower._id);
        await follower.save();
        await target.save();
        console.log(`User ${req.user.id} followed ${targetUsername}`);
      }
  
      res.status(200).json({ message: 'Followed successfully' });
    } catch (err) {
      console.error('Follow User Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Unfollow a user
  exports.unfollowUser = async (req, res) => {
    try {
      const follower = await UserProfile.findOne({ authId: req.user.id });
      const targetUsername = req.params.username;
      const targetAuth = await User.findOne({ username: targetUsername });
      if (!targetAuth) return res.status(404).json({ message: 'User not found' });
  
      const target = await UserProfile.findOne({ authId: targetAuth._id });
      if (!target) return res.status(404).json({ message: 'User profile not found' });
  
      follower.following = follower.following.filter((id) => !id.equals(target._id));
      target.followers = target.followers.filter((id) => !id.equals(follower._id));
      await follower.save();
      await target.save();
      console.log(`User ${req.user.id} unfollowed ${targetUsername}`);
  
      res.status(200).json({ message: 'Unfollowed successfully' });
    } catch (err) {
      console.error('Unfollow User Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Get followers
  exports.getFollowers = async (req, res) => {
    try {
      const { username } = req.params;
      const auth = await User.findOne({ username });
      if (!auth) return res.status(404).json({ message: 'User not found' });
      const user = await UserProfile.findOne({ authId: auth._id }).populate('followers', 'authId');
      res.status(200).json({ followers: user.followers });
    } catch (err) {
      console.error('Get Followers Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Get following
  exports.getFollowing = async (req, res) => {
    try {
      const { username } = req.params;
      const auth = await User.findOne({ username });
      if (!auth) return res.status(404).json({ message: 'User not found' });
      const user = await UserProfile.findOne({ authId: auth._id }).populate('following', 'authId');
      res.status(200).json({ following: user.following });
    } catch (err) {
      console.error('Get Following Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
// READ: Get user activity (posted, liked, commented reels)
exports.getUserActivity = async (req, res) => {
    try {
        const { username } = req.params;
        const auth = await User.findOne({ username });
        if (!auth) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = await UserProfile.findOne({ authId: auth._id })
            .populate("likedReels", "videoUrl caption")
            .populate("commentedReels", "videoUrl caption")
            .populate("authId", "username name");
        if (!user) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const postedReels = await Reel.find({ userId: user._id });
        const activity = {
            postedReels,
            likedReels: user.likedReels,
            commentedReels: user.commentedReels
        };

        res.status(200).json({ activity });
    } catch (err) {
        console.error("Get User Activity Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// LIKE: Like a reel
exports.likeReel = async (req, res) => {
    try {
        const { reelId } = req.params;
        const user = await UserProfile.findOne({ authId: req.user.id });
        const reel = await Reel.findById(reelId);

        if (!user || !reel) {
            return res.status(404).json({ message: "User or reel not found" });
        }

        if (!user.likedReels.includes(reelId)) {
            user.likedReels.push(reelId);
            reel.likes.push(user._id);
            await user.save();
            await reel.save();
        }

        const populatedUser = await UserProfile.findById(user._id).populate("authId", "username name");
        res.status(200).json({ message: "Reel liked successfully", user: populatedUser });
    } catch (err) {
        console.error("Like Reel Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// COMMENT: Comment on a reel
exports.commentOnReel = async (req, res) => {
    try {
        const { reelId } = req.params;
        const { text } = req.body;
        const user = await UserProfile.findOne({ authId: req.user.id });
        const reel = await Reel.findById(reelId);

        if (!user || !reel) {
            return res.status(404).json({ message: "User or reel not found" });
        }
        if (!text || text.length > 1000) {
            return res.status(400).json({ message: "Comment text is required and must be under 1000 characters" });
        }

        const comment = { userId: user._id, text };
        reel.comments.push(comment);
        if (!user.commentedReels.includes(reelId)) {
            user.commentedReels.push(reelId);
        }
        await reel.save();
        await user.save();

        const populatedUser = await UserProfile.findById(user._id).populate("authId", "username name");
        res.status(200).json({ message: "Comment added successfully", user: populatedUser, comment });
    } catch (err) {
        console.error("Comment On Reel Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = {
    createUserProfile: exports.createUserProfile,
    getUserProfile: exports.getUserProfile,
    getOwnProfile: exports.getOwnProfile,
    updateUserProfile: exports.updateUserProfile,
    deleteUserProfile: exports.deleteUserProfile,
    followUser: exports.followUser,
    unfollowUser: exports.unfollowUser,
    getFollowers: exports.getFollowers,
    getFollowing: exports.getFollowing,
    getUserActivity: exports.getUserActivity,
    likeReel: exports.likeReel,
    commentOnReel: exports.commentOnReel
};
