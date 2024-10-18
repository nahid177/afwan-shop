// src/app/api/upload/route.ts

import { NextResponse } from 'next/server';
import { uploadFileToS3 } from '@/utils/s3';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

function readableStreamToNodeStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.destroy(error);
        } else {
          this.destroy(new Error('Unknown error'));
        }
      }
    },
  });
}

interface FileLike {
  name: string;
  type: string;
  stream: () => ReadableStream<Uint8Array>;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { message: 'Unsupported content type' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files');

    console.log('Files received:', files);

    const uploadPromises = files.map(async (file) => {
      if (
        file instanceof Object &&
        'stream' in file &&
        typeof file.stream === 'function' &&
        'name' in file &&
        'type' in file
      ) {
        const fileLike = file as FileLike;
        const key = `${randomUUID()}-${fileLike.name}`;
        const contentType = fileLike.type || 'application/octet-stream';

        // Convert ReadableStream to Node.js Readable stream
        const nodeStream = readableStreamToNodeStream(fileLike.stream());

        const uploadResult = await uploadFileToS3(nodeStream, key, contentType);
        return uploadResult.Location;
      } else {
        console.error('File does not meet expected structure:', file);
        throw new Error('Expected a file');
      }
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls }, { status: 200 });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { message: 'Error uploading files' },
      { status: 500 }
    );
  }
}
