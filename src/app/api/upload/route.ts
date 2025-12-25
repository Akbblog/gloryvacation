import { NextResponse } from 'next/server';

const FREEIMAGE_KEY = process.env.FREEIMAGE_HOST_KEY || '6d207e02198a847aa98d0a2a901485a5';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { base64 } = body;
    if (!base64) return NextResponse.json({ message: 'Missing base64 payload' }, { status: 400 });

    const formData = new FormData();
    formData.append('key', FREEIMAGE_KEY);
    formData.append('action', 'upload');
    formData.append('source', base64);
    formData.append('format', 'json');

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    console.log('Freeimage.host response:', data); // Add logging for debugging
    
    if (data && data.status_code === 200 && data.image && data.image.url) {
      return NextResponse.json({ 
        url: data.image.url,
        thumb: data.image.thumb?.url,
        medium: data.image.medium?.url 
      });
    }

    console.error('Upload failed with response:', data);
    return NextResponse.json({ message: 'Upload failed', detail: data }, { status: 500 });
  } catch (err) {
    console.error('Upload proxy error', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
