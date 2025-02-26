const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reelSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        default: "",
        maxlength: 2200
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true,
            maxlength: 1000
        },
        created_at: {
            type: Date,
            default: Date.now
        }
    }],
    views: {
        type: Number,
        default: 0 // Tracks number of times the reel is viewed
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

module.exports = mongoose.model("Reel", reelSchema);