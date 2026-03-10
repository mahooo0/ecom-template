import { v2 as cloudinary } from 'cloudinary';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Configure Cloudinary inside the handler for edge compatibility
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Check for required secret
    if (!process.env.CLOUDINARY_API_SECRET) {
      return Response.json(
        { error: 'CLOUDINARY_API_SECRET is not configured' },
        { status: 500 }
      );
    }

    // Read parameters to sign from request body
    const body = await req.json();
    const { paramsToSign } = body;

    if (!paramsToSign) {
      return Response.json(
        { error: 'Missing paramsToSign in request body' },
        { status: 400 }
      );
    }

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return Response.json({ signature });
  } catch (error) {
    console.error('Error signing Cloudinary request:', error);
    return Response.json(
      { error: 'Failed to sign request' },
      { status: 500 }
    );
  }
}
