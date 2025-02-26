// require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") }); // Ensure credentials load
// const multer = require("multer");
// const AWS = require("aws-sdk");
// const multerS3 = require("multer-s3");
// const path = require("path");

// const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION
// });
// const storage = multerS3({
//     s3,
//     bucket: process.env.S3_BUCKET_NAME,
//     metadata: (req, file, cb) => {
//         cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//         const folder = file.fieldname === "profilePicture" ? "profile-pics" : "reels";
//         const uniqueName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
//         cb(null, uniqueName);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png|mp4/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);
//     if (extname && mimetype) {
//         cb(null, true);
//     } else {
//         cb(new Error("Only JPEG, PNG images, and MP4 videos are allowed"));
//     }
// };

// const upload = multer({
//     storage,
//     limits: { fileSize: 100 * 1024 * 1024, files: 1 },
//     fileFilter
// }).fields([
//     { name: "profilePicture", maxCount: 1 },
//     { name: "video", maxCount: 1 }
// ]);
// const uploadMiddleware = (req, res, next) => {
//     upload(req, res, (err) => {
//         if (err instanceof multer.MulterError) {
//             if (err.code === "LIMIT_FILE_SIZE") {
//                 return res.status(400).json({ message: "File too large, max 100MB" });
//             }
//             return res.status(400).json({ message: `Upload error: ${err.message}` });
//         } else if (err) {
//             return res.status(400).json({ message: err.message });
//         }
//         next();
//     });
// };

// module.exports = uploadMiddleware;


require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const multer = require("multer");
const AWS = require("aws-sdk");
const path = require("path");

console.log("AWS_ACCESS_KEY_ID in uploadMiddleware:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS_REGION in uploadMiddleware:", process.env.AWS_REGION);

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

s3.listBuckets((err, data) => {
    if (err) console.error("S3 Connection Error:", err);
    // else console.log("S3 Buckets:", data.Buckets.map(b => b.Name));
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|mp4/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG images, and MP4 videos are allowed"));
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024, files: 1 },
    fileFilter
}).fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "video", maxCount: 1 }
]);

const uploadMiddleware = async (req, res, next) => {
    console.log("Incoming request body:", req.body);
    console.log("Incoming request files before upload:", req.files);

    try {
        await new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err instanceof multer.MulterError) {
                    if (err.code === "LIMIT_FILE_SIZE") {
                        return reject(new Error("File too large, max 100MB"));
                    }
                    return reject(new Error(`Upload error: ${err.message}`));
                } else if (err) {
                    return reject(err);
                }
                resolve();
            });
        });

        //console.log("Files after multer parse:", JSON.stringify(req.files, null, 2));

        if (req.files && req.files.profilePicture) {
            const file = req.files.profilePicture[0];
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `profile-pics/${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`,
                Body: file.buffer,
                ContentType: file.mimetype
            };

            // console.log("Uploading to S3 with params:", params);
            const uploadResult = await s3.upload(params).promise();
            // console.log("S3 Upload Success:", uploadResult);
            req.files.profilePicture[0].location = uploadResult.Location;
        } else {
            console.warn("No profilePicture file uploaded");
        }

        next();
    } catch (err) {
        //console.error("Upload Middleware Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Upload failed", error: err.message });
        }
    }
};

module.exports = uploadMiddleware;