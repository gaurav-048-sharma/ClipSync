const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

// Define the User schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    name: {
        type: String,
        default: "",
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Password is required ONLY if googleId is NOT present
        },
        minlength: 6
    },
    googleId: {
        type: String,
        sparse: true, // Still allows nulls to be excluded from index
        default: undefined // Avoid indexing null values entirely
    },
    microsoftId: { 
        type: String
     },
    segregation: {
        year: { 
            type: String
         },
        dept: { 
            type: String
         },
        roll: { 
            type: String
         },
        type: { 
            type: String, 
            default: 'general'
         },
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

// Static method to segregate user by college ID
userSchema.statics.segregateUser = function (username) {
    const regex = /^(\d{2})([A-Z]{4})(\d{3})$/; // Matches e.g., 23BTIT101, 22CSIT112
    const match = username.match(regex);
    if (match) {
      return {
        year: match[1], // e.g., "23"
        dept: match[2], // e.g., "BTIT"
        roll: match[3], // e.g., "101"
        type: 'student',
      };
    }
    return { type: 'general' };
  };
  userSchema.pre('save', async function (next) {
    try {
      // Hash password if modified and no Google/Microsoft ID
      if (!this.googleId && !this.microsoftId && this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('✅ Password Hashed:', this.password);
      }
  
      // Segregate username if modified or new
      if (this.isModified('username') || this.isNew) {
        this.segregation = this.constructor.segregateUser(this.username);
        console.log('Segregation applied:', this.segregation);
      }
  
      next();
    } catch (error) {
      console.error('Pre-save error:', error);
      next(error);
    }
  });
// // Pre-save middleware to hash password for non-Google users
// userSchema.pre("save", async function (next) {
//     // If the user has a googleId, skip password hashing and proceed
//     if (this.googleId) return next();

//     // If the password field hasn’t been modified, skip hashing
//     if (!this.isModified("password")) return next();

//     try {
//         // Generate a salt with 10 rounds
//         const salt = await bcrypt.genSalt(10);
//         // Hash the password with the salt
//         this.password = await bcrypt.hash(this.password, salt);
//         console.log("✅ Password Hashed:", this.password); // Log for debugging
//         next(); // Proceed with saving the document
//     } catch (error) {
//         console.error("Error hashing password:", error); // Log error for debugging
//         return next(error); // Pass the error to the next middleware
//     }
// });

// Export the User model
module.exports = mongoose.model("User", userSchema);