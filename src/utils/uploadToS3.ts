import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,//
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
  requestHandler: {
    // Increase the timeout settings
    connectionTimeout:  300000,//  
    socketTimeout: 300000, //  
  },
});

export const uploadFileToS3 = async (fileBuffer: Buffer, key: string, contentType: string): Promise<{ Location: string }> => {
  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  };

  const parallelUploads3 = new Upload({
    client: s3Client,
    params,
    leavePartsOnError: false, // optional manually handle dropped parts
  });

  await parallelUploads3.done();

  return { Location: `https://${params.Bucket}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}` };
};

export const deleteFileFromS3 = async (key: string) => {
  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);
  try {
    const response = await s3Client.send(command);
    console.log('Delete response from S3:', response);
    return response;
  } catch (error) {
    console.error('Error deleting S3 object:', error);
    throw new Error('Failed to delete S3 object');
  }
};
