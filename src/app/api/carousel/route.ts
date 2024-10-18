import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { uploadFileToS3 } from '@/utils/s3'; // Import your S3 helper functions
import Carousel from '@/models/Carousel'; // Import the Carousel schema

// Connect to the database
dbConnect();

// Handle POST request for uploading carousel images
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File; // Fetch the image from the form, cast it to 'File'
    const name = formData.get('name') as string; // Fetch the name from the form

    if (!file || !name) {
      return NextResponse.json({ message: 'Image and name are required' }, { status: 400 });
    }

    // Convert the image file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const key = `carousel/${Date.now()}_${file.name}`; // 'file.name' will now work because it's cast as 'File'
    const contentType = file.type;

    const uploadResult = await uploadFileToS3(fileBuffer, key, contentType);

    // Save the image metadata (including name) in MongoDB
    const newCarouselImage = new Carousel({
      name, // Save the name field
      imageUrl: uploadResult.Location, // Store the image URL
    });

    await newCarouselImage.save();

    return NextResponse.json({ message: 'Image uploaded successfully', image: newCarouselImage }, { status: 200 });
  } catch (error) {
    console.error('Error uploading carousel image:', error);
    return NextResponse.json({ message: 'Error uploading carousel image' }, { status: 500 });
  }
}
