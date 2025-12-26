import { NextResponse } from 'next/server';
import { Readable } from 'stream';

const FREEIMAGE_KEY = process.env.FREEIMAGE_HOST_KEY || '6d207e02198a847aa98d0a2a901485a5';

// Optional FTP / Bluehost settings (set these in env for production):
const FTP_HOST = process.env.FTP_HOST;
const FTP_PORT = process.env.FTP_PORT ? Number(process.env.FTP_PORT) : 21;
const FTP_USER = process.env.FTP_USER;
const FTP_PASS = process.env.FTP_PASS;
const FTP_BASE_DIR = process.env.FTP_BASE_DIR || '/public_html/uploads/properties';
const SITE_DOMAIN = process.env.SITE_DOMAIN || process.env.NEXT_PUBLIC_SITE_DOMAIN || '';

function randomFilename(ext = '.jpg') {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { base64 } = body;
    if (!base64) return NextResponse.json({ message: 'Missing base64 payload' }, { status: 400 });

    // If FTP is configured, upload to FTP (Bluehost) directly.
    if (FTP_HOST && FTP_USER && FTP_PASS && SITE_DOMAIN) {
      // Lazy-import to avoid adding dependency when not used
      const FTP = await import('basic-ftp');
      const client = new FTP.Client();
      client.ftp.verbose = false;

      // create a readable stream from base64
      const buffer = Buffer.from(base64, 'base64');
      const extMatch = base64.substring(0, 30).includes('png') ? '.png' : '.jpg';
      const filename = randomFilename(extMatch);
      // optional folder (per-listing)
      const rawFolder = (body && (body.folder || body.uploadFolder)) || '';
        function sanitizeFolder(f: string) {
          let s = String(f).trim();
          // strip leading/trailing slashes
          while (s.startsWith('/')) s = s.slice(1);
          while (s.endsWith('/')) s = s.slice(0, -1);
          // replace spaces with dashes
          s = s.split(' ').filter(Boolean).join('-');
          // remove disallowed characters, replace with dash
          const out: string[] = [];
          for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            const code = ch.charCodeAt(0);
            const allowed = (code >= 48 && code <= 57) || // 0-9
                            (code >= 65 && code <= 90) || // A-Z
                            (code >= 97 && code <= 122) || // a-z
                            ch === '-' || ch === '_' || ch === '/';
            out.push(allowed ? ch : '-');
          }
          return out.join('').replace(/-+/g, '-');
        }
      const folder = rawFolder ? sanitizeFolder(String(rawFolder)) : '';
        let remoteDir = folder ? `${FTP_BASE_DIR.replace(/(^\/+|\/+$)/g,'')}/${folder}` : FTP_BASE_DIR;
        remoteDir = remoteDir.replace(/\\/g, '/').replace(/\/+/g, '/');
        let remotePath = `${remoteDir}/${filename}`;
        remotePath = remotePath.replace(/\\/g, '/').replace(/\/+/g, '/');

      try {
        await client.access({ host: FTP_HOST, port: FTP_PORT, user: FTP_USER, password: FTP_PASS, secure: false });
        // ensure directory (create per-listing folder if provided)
        await client.ensureDir(remoteDir);

        const stream = Readable.from(buffer);
        await client.uploadFrom(stream as any, remotePath);
        client.close();

        // Build public URL: strip leading public_html if present
        let webPath = remoteDir.replace(/^\/?public_html\/?/, '');
        webPath = webPath.replace(/^\/+/, '');
        const url = SITE_DOMAIN.replace(/\/$/, '') + '/' + (webPath ? `${webPath}/${filename}` : filename);
        return NextResponse.json({ url });
      } catch (ftpErr) {
        console.error('FTP upload error', ftpErr);
        try { client.close(); } catch (e) {}
        return NextResponse.json({ message: 'FTP upload failed', detail: String(ftpErr) }, { status: 500 });
      }
    }

    // Fallback: proxy to freeimage.host
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
    console.log('Freeimage.host response:', data);

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
