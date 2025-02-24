const BlacklistToken = require("../models/blacklistedToken");

const checkBlacklist = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
  
    const blacklistedToken = await BlacklistToken.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ error: 'Token is blacklisted' });
    }
  
    next();
};
  
module.exports = checkBlacklist;