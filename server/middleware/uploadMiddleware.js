const { createS3Uploader } = require("../utils/s3Upload");

const upload = createS3Uploader({
  keyPrefix: "profile-photos",
  allowedTypes: /jpeg|jpg|png|webp/,
  maxSizeMB: 5,
  fieldName: "photo",
});

module.exports = { upload };
