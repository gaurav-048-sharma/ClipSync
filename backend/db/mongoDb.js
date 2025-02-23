const mongoose = require("mongoose");

exports.connectDb = async (req, res) => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env file");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB")
    } catch (error) {
        console.log(error, "Not connected to MongoDB")
        process.exit(1);
    }
}