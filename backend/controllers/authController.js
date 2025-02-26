const User = require('../models/authModel.js');
const UserProfile = require("../models/userModel.js")
const BlacklistedToken = require("../models/blacklistedToken.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library'); // Add Google Auth Library

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // From .env
const client = new OAuth2Client(CLIENT_ID);

// Existing signup function
exports.signup = async (req, res) => {
    try {
        const { username, name,email, password } = req.body;
        //const existingUser = await User.findOne({ email });
        // if (existingUser) {
        //     return res.status(400).json({ message: "User already exists" });
        // }
        if (!password) {
            return res.status(400).json({ message: "Password is required for email signup" });
        }
        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ message: "Username must be 3-30 characters" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        const existingAuth = await User.findOne({ $or: [{ username }, { email }] });
        if (existingAuth) {
            return res.status(400).json({ 
                message: existingAuth.username === username ? "Username already taken" : "Email already exists" 
            });
        }

        const user = new User({ username,name, email, password });
        await user.save();
        // res.status(201).json({ message: "User created successfully", user });


        // Create User profile
        const userProfile = new UserProfile({ authId: user._id });
        await userProfile.save();

        res.status(201).json({ message: "User created successfully", user});
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


// READ: Get public user info by username
exports.getUser = async (req, res) => {
    try {
        const { username } = req.params;
        const auth = await User.findOne({ username }).select("username name created_at");
        if (!auth) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(auth);
    } catch (err) {
        console.error("Get User Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// READ: Get own profile (authenticated)
exports.getOwnProfile = async (req, res) => {
    try {
        const auth = await User.findById(req.user.id).select("-password -googleId");
        if (!auth) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(auth);
    } catch (err) {
        console.error("Get Own Profile Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// UPDATE: Update profile (authenticated)
exports.updateProfile = async (req, res) => {
    try {
        const { username, name, password } = req.body;
        const auth = await User.findById(req.user.id);
        if (!auth) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update username if provided and available
        if (username && username !== auth.username) {
            if (username.length < 3 || username.length > 30) {
                return res.status(400).json({ message: "Username must be 3-30 characters" });
            }
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: "Username already taken" });
            }
            auth.username = username;
        }

        // Update name if provided
        if (name !== undefined) auth.name = name;

        // Update password if provided
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters" });
            }
            auth.password = password; // Pre-save hook hashes it
        }

        auth.updated_at = Date.now();
        await auth.save();

        res.status(200).json({ 
            message: "Profile updated", 
            auth,
            //user: { username: auth.username, name: auth.name, email: auth.email } 
        });
    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE: Delete account (authenticated)
exports.deleteAccount = async (req, res) => {
    try {
        const auth = await User.findById(req.user.id);
        if (!auth) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete linked User profile (cascade delete)
        const user = await UserProfile.findOneAndDelete({ authId: auth._id });
        if (!user) {
            console.warn("No associated User profile found for authId:", auth._id);
        }

        // Delete the Auth user
        await auth.deleteOne();

        res.status(200).json({ message: "Account and profile deleted successfully" });
    } catch (err) {
        console.error("Delete Account Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server error", error: err.message });
        }
    }
};

// Existing login function
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }
        if (user.googleId) {
            return res.status(400).json({ message: "This account uses Google authentication. Please log in with Google." });
        }
        if (!user.password) {
            return res.status(400).json({ message: "No password set for this account" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: "An error occurred during login" });
    }
};

// Google Login (new function)
// exports.googleLogin = async (req, res) => {
//     try {
//         const { token: idToken } = req.body; // Google ID token from frontend
//         if (!idToken) {
//             return res.status(400).json({ message: "Google token is required" });
//         }

//         // Verify Google ID token
//         const ticket = await client.verifyIdToken({
//             idToken,
//             audience: CLIENT_ID,
//         });
//         const payload = ticket.getPayload();
//         const googleId = payload['sub'];
//         const email = payload['email'];
//         const username = payload['name'] || email.split('@')[0];

//         // Check if user exists
//         let user = await User.findOne({ googleId });
//         if (!user) {
//             const existingEmailUser = await User.findOne({ email });
//             if (existingEmailUser) {
//                 return res.status(400).json({ 
//                     message: "Email is already registered with a password account. Please log in with email/password or merge accounts." 
//                 });
//             }
//             user = new User({ username, email, googleId });
//             await user.save();
//             console.log('New Google User Created:', user);
//         }

//         // Generate JWT token
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
//         res.status(200).json({ message: "Google login successful", token });
//     } catch (err) {
//         console.error('Google Login Error:', err);
//         res.status(500).json({ error: "Google login failed", details: err.message });
//     }
// };

exports.googleLogin = async (req, res) => {
    try {
        const { token: idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ message: "Google token is required" });
        }

        const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
        const payload = ticket.getPayload();
        const googleId = payload["sub"];
        const email = payload["email"];
        const username = payload["email"].split("@")[0];
        const name = payload["name"] || "";

        let auth = await User.findOne({ googleId });
        if (!auth) {
            const existingAuth = await Auth.findOne({ $or: [{ username }, { email }] });
            if (existingAuth) {
                return res.status(400).json({ 
                    message: existingAuth.username === username ? "Username taken" : "Email already exists" 
                });
            }
            auth = new User({ username, name, email, googleId });
            await auth.save();

            const user = new UserProfile({ authId: auth._id });
            await user.save();
        }

        const token = jwt.sign({ id: auth._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Google login successful", token, username: auth.username });
    } catch (err) {
        console.error("Google Login Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Existing logout function
exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const blacklistedToken = new BlacklistedToken({ token });
        await blacklistedToken.save();
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Logout Error:', err);
        res.status(400).json({ error: err.message });
    }
};
module.exports = {
    signup: exports.signup,
    getUser: exports.getUser,
    getOwnProfile: exports.getOwnProfile,
    updateProfile: exports.updateProfile,
    deleteAccount: exports.deleteAccount,
    login: exports.login,
    googleLogin: exports.googleLogin,
    logout: exports.logout
};




// const User = require('../models/authModel.js');
// const BlacklistedToken = require("../models/blacklistedToken.js");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// exports.signup = async (req, res) => {
//     try {
//         const { username, email, password } = req.body;

//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: "User already exists" });
//         }

//         // Ensure password is at least 6 characters
//         if (password.length < 6) {
//             return res.status(400).json({ message: "Password must be at least 6 characters long" });
//         }

//         // Hash password before saving
//         const passwordHash = await bcrypt.hash(password, 10);
//         console.log('Hashed Password at Signup:', passwordHash);

//         // Create and save user
//         const user = new User({
//             username,
//             email,
//             password: passwordHash  // Store hashed password
//         });
//         await user.save();

//         res.status(201).json({ message: "User created successfully", user });
//     } catch (err) {
//         console.error("Signup Error:", err);
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// };

// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Check if user exists
//         const user = await User.findOne({ email: req.body.email });
//         if (!user) {
//             return res.status(400).json({ message: "User does not exist" });
//         }
//         console.log('User Found:', user);

//         // Compare passwords
//         const isMatch = await bcrypt.compare(req.body.password, user.password);
//         console.log('Password Match:', isMatch);

//         if (!isMatch) {
//             return res.status(400).json({ message: "Incorrect password" });
//         }

//         // Generate JWT token
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//         res.status(200).json({ message: "Login successful", token });
//     } catch (err) {
//         console.error('Login Error:', err);
//         res.status(500).json({ error: err.message });
//     }
// };


// exports.logout = async (req, res) => {
//     try {
//         const token = req.headers.authorization.split(" ")[1]; // Extract token from Authorization header
//         const blacklistedToken = new BlacklistedToken({ token });
//         await blacklistedToken.save();
//         res.status(200).json({ message: 'Logout successful' });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };
