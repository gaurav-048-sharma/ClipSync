require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser")
const PORT = process.env.PORT;
const authRoute = require("./routes/authRoutes.js")

const connectDb = require("./db/mongoDb.js")


//middleware
app.use(bodyParser.json());

//routes
app.use("/auth",authRoute );

app.listen(PORT, (req, res) => {
    connectDb();
    console.log(`Server listening on http://localhost:${PORT}`);
});