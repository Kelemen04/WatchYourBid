import * as Minio from 'minio'

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

const bucket = process.env.MINIO_BUCKET || "watchyourbid";

export async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(bucket);

    if (!exists) {
        await minioClient.makeBucket(bucket, "us-east-1");
        console.log(`MinIO: Bucket created automatically: ${bucket}`);
    } else {
        console.log(`MinIO: Bucket exists: ${bucket}`);
    }

    const publicReadPolicy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    };

    await minioClient.setBucketPolicy(bucket, JSON.stringify(publicReadPolicy));
    console.log(`MinIO: Access policy automatically set to READ-ONLY (Public) for: ${bucket}`);

  } catch (error) {
    console.error("MinIO auto-init failed:", error);
  }
}