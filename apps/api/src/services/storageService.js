const { S3Client, PutObjectCommand, GetObjectCommand, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

class StorageService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true, // Required for MinIO
    });
    this.bucketName = process.env.S3_BUCKET_NAME || 'event-mgmt';
    this.initBucket();
  }

  async initBucket() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      console.log(`Bucket "${this.bucketName}" is ready.`);
    } catch (error) {
      // Bucket doesn't exist, create it
      try {
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
        console.log(`Bucket "${this.bucketName}" created.`);
      } catch (createError) {
        console.error('Error creating bucket:', createError.message);
      }
    }
  }

  async uploadFile(file) {
    // Sanitize filename to avoid URL encoding issues
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const fileName = `${Date.now()}-${safeFilename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    // Generate a presigned URL valid for 7 days — this works even in private buckets
    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    const signedUrl = await getSignedUrl(this.s3Client, getCommand, { expiresIn: 604800 });
    return signedUrl;
  }
}

module.exports = new StorageService();
