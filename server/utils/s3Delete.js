const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("./s3Upload");

/**
 * Deletes a single object from S3 by its key.
 *
 * @param {string} s3Key - The S3 object key to delete (e.g. "resources/abc-1234.pdf")
 * @returns {Promise<void>}
 * @throws Will throw if the S3 delete request fails
 */
const deleteFromS3 = async (s3Key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
  });
  await s3.send(command);
};

module.exports = { deleteFromS3 };
