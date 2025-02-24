const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

const blacklistedSchema =new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true, // ✅ Prevent duplicate tokens
        index: true   // ✅ Faster queries
    },
    created_at : {
        type: Date, 
        default: Date.now,
        expires: 3600 
    }
});

module.exports = mongoose.model("BlacklistedToken",blacklistedSchema );