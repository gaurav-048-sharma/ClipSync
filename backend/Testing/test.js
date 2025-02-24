const bcrypt = require("bcrypt");

// Replace with the actual hashed password from MongoDB
const storedHashedPassword = "$2b$10$wk0XgTJAgehrSpfE0/AGseCzY.6/ar.a.MZxDZNU8f770Fh5fl8eu"; 

// Replace with the password you're trying to log in with
const inputPassword = "1234567"; 

bcrypt.compare(inputPassword, storedHashedPassword)
    .then(match => console.log("✅ Password Match:", match))
    .catch(err => console.error("❌ Error:", err));
