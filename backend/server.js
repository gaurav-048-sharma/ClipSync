require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const authRoute = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js")
const passport = require('passport');
const session = require('express-session');
const connectDb = require("./db/mongoDb.js")


// Import Passport Configuration
require('./config/passport.js')
//middleware
app.use(express.json());

// Initialize Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret', // Better practice to use env variable for secret
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

//routes
app.use("/api/auth",authRoute );
app.use("/api/users", userRoutes);

app.listen(PORT, (req, res) => {
    connectDb();
    console.log(`Server listening on http://localhost:${PORT}`);
});