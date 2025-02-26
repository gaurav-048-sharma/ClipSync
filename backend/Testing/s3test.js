// test-s3.js
const AWS = require("aws-sdk");
const fs = require("fs");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const uploadToS3 = () => {
    const fileContent = fs.readFileSync("pfp.jpeg"); // Replace with a real file path
    const params = {
        Bucket: "gaurav-reels-bucket",
        Key: "testing/pfp.jpeg",
        Body: fileContent,
        ContentType: "image/jpeg"
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error("S3 Upload Error:", err);
        } else {
            console.log("Upload Success:", data.Location);
        }
    });
};

uploadToS3();