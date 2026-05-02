const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure directories exist
const uploadDir = path.join(__dirname, "../uploads");
const coverDir = path.join(uploadDir, "announcements/covers");
const attachDir = path.join(uploadDir, "announcements/attachments");

[coverDir, attachDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "coverImage") {
            cb(null, coverDir);
        } else {
            cb(null, attachDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadCoverImage = multer({ storage });
const uploadAttachments = multer({ storage });

module.exports = { uploadCoverImage, uploadAttachments };