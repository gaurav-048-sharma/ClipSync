const User = require('../models/authModel.js');
const BlacklistedToken =require("../models/blacklistedToken.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // ✅ Ensure password is at least 6 characters
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // ✅ Fix: Hash password before saving
        const passwordHash = await bcrypt.hash(password, 10);

        // Create and save user
        const user = new User({
            username,
            email,
            password: passwordHash  // Store hashed password
        });
        await user.save();

        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.logout = async (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1]; // Extract token from Authorization header
      const blacklistedToken = new BlacklistedToken({ token });
      await blacklistedToken.save();
      res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };