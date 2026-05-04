const { createS3Uploader } = require("./s3Upload");

// One uploader handles both cover image and attachments.
const uploadAnnouncementFiles = createS3Uploader({
  keyPrefix: "announcements",
  allowedTypes:
    /pdf|doc|docx|msword|wordprocessingml|ppt|pptx|powerpoint|presentation|jpeg|jpg|png|webp/,
  maxSizeMB: 25,
});

module.exports = { uploadAnnouncementFiles };