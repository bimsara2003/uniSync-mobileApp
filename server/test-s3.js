const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testS3() {
  try {
    const data = await s3.send(new ListBucketsCommand({}));
    console.log("S3 connection successful. Buckets:", data.Buckets.map(b => b.Name));
  } catch (err) {
    console.error("S3 connection failed:", err.message);
  }
}

testS3();
