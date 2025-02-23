require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const connectDb = require("./db/mongoDb.js")



app.listen(PORT, async (req, res) => {
    await connectDb();
    console.log(`Server listening on http://localhost:${PORT}`);
});