const User = require('../models/authModel.js');
const BlacklistedToken = require("../models/blacklistedToken.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library'); // Add Google Auth Library

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // From .env
const client = new OAuth2Client(CLIENT_ID);

// Existing signup function
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required for email signup" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: "User created successfully", user });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
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
exports.googleLogin = async (req, res) => {
    try {
        const { token: idToken } = req.body; // Google ID token from frontend
        if (!idToken) {
            return res.status(400).json({ message: "Google token is required" });
        }

        // Verify Google ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const email = payload['email'];
        const username = payload['name'] || email.split('@')[0];

        // Check if user exists
        let user = await User.findOne({ googleId });
        if (!user) {
            const existingEmailUser = await User.findOne({ email });
            if (existingEmailUser) {
                return res.status(400).json({ 
                    message: "Email is already registered with a password account. Please log in with email/password or merge accounts." 
                });
            }
            user = new User({ username, email, googleId });
            await user.save();
            console.log('New Google User Created:', user);
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Google login successful", token });
    } catch (err) {
        console.error('Google Login Error:', err);
        res.status(500).json({ error: "Google login failed", details: err.message });
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
