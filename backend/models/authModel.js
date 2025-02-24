const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = Schema({
    username : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true,
        minlength: 6 
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    is_active: { 
        type: Boolean, 
        default: true 
    },
    is_verified: { 
        type: Boolean, 
        default: false 
    },
});

userSchema.pre("save", async (next) =>{
    if (!this.isModified("password")) return next(); // Skip if password isn't modified

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});


module.exports = mongoose.model("User", userSchema);
