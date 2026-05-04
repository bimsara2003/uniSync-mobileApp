const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
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
        path.extname(file.originalname).toLowerCase(),
      );
      const mimeMatch = allowedTypes.test(file.mimetype);
      if (extMatch && mimeMatch) {
        cb(null, true);
      } else {
        const err = new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          file.fieldname,
        );
        err.message = `File type not allowed. Accepted types: ${allowedTypes.source}`;
        cb(err);
      }
    },
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });
};

/**
 * Generates a presigned GET URL for a private S3 object.
 * @param {string} key - The S3 object key
 * @param {number} expiresIn - Expiry in seconds (default: 3600)
 */
const getPresignedUrl = (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn });
};

module.exports = { createS3Uploader, s3, getPresignedUrl };
