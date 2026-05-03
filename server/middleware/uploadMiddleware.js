const { createS3Uploader } = require("../utils/s3Upload");

let upload;

const getUpload = () => {
  if (!upload) {
    upload = createS3Uploader({
      keyPrefix: "profile-photos",
      allowedTypes: /jpeg|jpg|png|webp/,
      maxSizeMB: 5,
      fieldName: "photo",
    });
  }
  return upload;
};

module.exports = { getUpload };