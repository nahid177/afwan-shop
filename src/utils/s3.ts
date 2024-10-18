// src/utils/s3.ts

import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadFileToS3 = async (
  fileStream: Readable,
  key: string,
  contentType: string
): Promise<{ Location: string }> => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: fileStream, // Accepting Readable stream
    ContentType: contentType,
  };

  const upload = new Upload({
    client: s3Client,
    params,
    leavePartsOnError: false,
  });

  try {
    await upload.done();
    return {
      Location: `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload to S3');
  }
};
