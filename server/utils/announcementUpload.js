const { createS3Uploader } = require("./s3Upload");

// Cover image uploader (single image field)
const uploadCoverImage = createS3Uploader({
  keyPrefix: "announcements/covers",
  allowedTypes: /jpeg|jpg|png|webp/,
  maxSizeMB: 10,
  fieldName: "coverImage",
});

// Attachments uploader (single call per file; the route uses .array())
const uploadAttachments = createS3Uploader({
  keyPrefix: "announcements/attachments",
  allowedTypes: /pdf|doc|docx|ppt|pptx|xlsx|zip|jpeg|jpg|png/,
  maxSizeMB: 20,
  fieldName: "attachments",
});

module.exports = { uploadCoverImage, uploadAttachments };