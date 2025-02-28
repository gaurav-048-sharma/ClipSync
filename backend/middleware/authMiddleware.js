const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // Extract token from Authorization header (Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        // Verify token using JWT_SECRET from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded payload (e.g., { id: "auth_id" }) to request
        ///console.log("Token verified for user:", decoded.id); // Debug log (remove in production)
        next();
    } catch (err) {
        console.error("Token verification error:", err.message); // Debug log
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token has expired" });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        return res.status(401).json({ message: "Authentication failed" });
    }
};

module.exports = authMiddleware;