const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    authId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true // Ensures one profile per auth user
    },
    bio: {
        type: String,
        default: "",
        maxlength: 150 // Instagram-like bio limit
    },
    profilePicture: {
        type: String,
        default: "default-profile-pic.jpg" // Path or URL
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("UserProfile", userSchema);