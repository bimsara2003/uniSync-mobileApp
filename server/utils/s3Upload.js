const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Creates a multer middleware configured for S3 uploads.
 *
 * @param {object} options
 * @param {string}  options.keyPrefix      - S3 key prefix, e.g. "resources" or "events/banner"
 * @param {RegExp}  options.allowedTypes   - Regex tested against both file extension and mimetype
 * @param {number}  options.maxSizeMB      - Maximum allowed file size in megabytes
 * @param {string}  options.fieldName      - Form-data field name (default: "file")
 * @returns {multer.Multer}
 */
const createS3Uploader = ({
  keyPrefix,
  allowedTypes,
  maxSizeMB,
  fieldName = "file",
}) => {
  return multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const userId = req.user ? req.user._id : "unknown";
        cb(null, `${keyPrefix}/${userId}-${Date.now()}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const extMatch = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimeMatch = allowedTypes.test(file.mimetype);
      if (extMatch && mimeMatch) {
        cb(null, true);
      } else {
        cb(new Error(`File type not allowed. Accepted: ${allowedTypes.source}`));
      }
    },
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });
};

module.exports = { createS3Uploader, s3 };
