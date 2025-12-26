/*
Migration script: uploads property images to Bluehost FTP and updates MongoDB `images` arrays.

Usage (dry run):

DRY_RUN=1 LIMIT_PROPERTIES=10 CONCURRENCY=3 node scripts/migrate-bluehost-images.js

Or with JSON file (export properties first with mongoexport):

node scripts/migrate-bluehost-images.js --json-file properties.json

Environment variables (recommended set in a .env or exported):
- MONGODB_URI (required unless using --json-file)
- DB_NAME (optional, default from URI)
- COLLECTION (optional, default 'properties')
- FTP_HOST, FTP_PORT, FTP_USER, FTP_PASS (required for real run)
- FTP_BASE_DIR (optional, default 'public_html/uploads/properties')
- SITE_DOMAIN (required for computing public URLs, e.g. https://yourdomain.com)
- DRY_RUN=1 to test without uploading or updating DB
- LIMIT_PROPERTIES to limit processed properties (for testing)
- CONCURRENCY controls per-property parallelism when downloading/uploading images
*/

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Readable } = require('stream');
const FTP = require('basic-ftp');
const { MongoClient, ObjectId } = require('mongodb');

require('dotenv').config();

const args = process.argv.slice(2);
let jsonFile = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--json-file' && args[i+1]) {
    jsonFile = args[i+1];
    i++;
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI && !jsonFile) {
  console.error('MONGODB_URI environment variable is required unless using --json-file');
  process.exit(1);
}

const DB_NAME = process.env.DB_NAME || undefined; // let MongoClient pick if undefined
const COLLECTION = process.env.COLLECTION || 'properties';
const FTP_HOST = process.env.FTP_HOST;
const FTP_PORT = Number(process.env.FTP_PORT || 21);
const FTP_USER = process.env.FTP_USER;
const FTP_PASS = process.env.FTP_PASS;
const FTP_BASE_DIR = process.env.FTP_BASE_DIR || 'public_html/uploads/properties';
const SITE_DOMAIN = (process.env.SITE_DOMAIN || '').replace(/\/$/, '');
const DRY_RUN = process.env.DRY_RUN === '1' || false;
const LIMIT_PROPERTIES = Number(process.env.LIMIT_PROPERTIES || 0);
const CONCURRENCY = Number(process.env.CONCURRENCY || 3);

const tmpDir = path.join(process.cwd(), 'tmp_migrate_imgs');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

function sanitizeFolder(name) {
  if (!name) return '';
  let s = String(name).trim();
  while (s.startsWith('/')) s = s.slice(1);
  while (s.endsWith('/')) s = s.slice(0, -1);
  s = s.split(' ').filter(Boolean).join('-');
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const code = ch.charCodeAt(0);
    const allowed = (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || ch === '-' || ch === '_' || ch === '/';
    out.push(allowed ? ch : '-');
  }
  return out.join('').replace(/-+/g, '-');
}

function makeFilename(url, index = 0) {
  try {
    const parsed = new URL(url);
    const base = path.basename(parsed.pathname);
    const safeBase = base.replace(/[^a-zA-Z0-9._-]/g, '-');
    return `${index ? index + '-' : ''}${Date.now()}-${safeBase}`.toLowerCase();
  } catch (e) {
    return `${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
  }
}

async function downloadToBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
  return Buffer.from(res.data);
}

async function uploadBufferToFtp(client, buffer, remotePath) {
  const stream = Readable.from(buffer);
  await client.uploadFrom(stream, remotePath);
}

async function processProperty(prop, client) {
  const id = prop._id.toString();
  const folder = sanitizeFolder(prop.slug || id);
  const images = Array.isArray(prop.images) ? prop.images : [];
  if (images.length === 0) return { updated: false, reason: 'no-images' };

  const results = [];
  for (let i = 0; i < images.length; i++) {
    const imgUrl = images[i];
    if (typeof imgUrl !== 'string') { results.push(imgUrl); continue; }
    // Skip if already on SITE_DOMAIN and path starts with FTP_BASE_DIR location
    if (SITE_DOMAIN && imgUrl.startsWith(SITE_DOMAIN)) {
      results.push(imgUrl);
      continue;
    }

    try {
      const buffer = await downloadToBuffer(imgUrl);
      const filename = makeFilename(imgUrl, i+1);
      let remoteDir = folder ? `${FTP_BASE_DIR.replace(/^\/+|\/+$/g,'')}/${folder}` : FTP_BASE_DIR;
      remoteDir = remoteDir.replace(/\\/g, '/').replace(/\/+/g, '/');
      const remotePath = `${remoteDir}/${filename}`.replace(/\\/g, '/').replace(/\/+/g, '/');

      const publicPath = remoteDir.replace(/^\/?public_html\/?/, '').replace(/^\/+/, '');
      const newUrl = SITE_DOMAIN ? `${SITE_DOMAIN}/${publicPath}/${filename}` : null;

      if (DRY_RUN) {
        console.log(`DRY: would upload ${imgUrl} -> ${remotePath} (public ${newUrl})`);
        results.push(newUrl || imgUrl);
        continue;
      }

      // ensure dir and upload
      await client.ensureDir(remoteDir);
      await uploadBufferToFtp(client, buffer, remotePath);
      results.push(newUrl || imgUrl);
      console.log(`Uploaded ${imgUrl} -> ${newUrl}`);
    } catch (err) {
      console.warn(`Failed image ${imgUrl}:`, err.message || err);
      results.push(imgUrl); // keep original if upload failed
    }
  }

  // Return new images array
  return { updated: true, images: results };
}

(async () => {
  let properties = [];
  let mongo, db, col;

  if (jsonFile) {
    console.log(`Reading properties from ${jsonFile}`);
    const data = fs.readFileSync(jsonFile, 'utf8');
    properties = JSON.parse(data);
    console.log(`Loaded ${properties.length} properties from JSON`);
  } else {
    mongo = new MongoClient(MONGODB_URI);
    await mongo.connect();
    db = DB_NAME ? mongo.db(DB_NAME) : mongo.db();
    col = db.collection(COLLECTION);

    const query = {}; // migrate all
    const cursor = col.find(query).batchSize(50);
    const total = await cursor.count();
    console.log(`Found ${total} properties in DB`);
    properties = await cursor.toArray();
  }

  const ftpClient = new FTP.Client();
  ftpClient.ftp.verbose = false;

  try {
    if (!DRY_RUN) {
      if (!FTP_HOST || !FTP_USER || !FTP_PASS) {
        console.error('FTP credentials missing; set FTP_HOST, FTP_USER, FTP_PASS');
        process.exit(1);
      }
      await ftpClient.access({ host: FTP_HOST, port: FTP_PORT, user: FTP_USER, password: FTP_PASS, secure: false });
    }

    if (!jsonFile && !mongo) {
      mongo = new MongoClient(MONGODB_URI);
      await mongo.connect();
      db = DB_NAME ? mongo.db(DB_NAME) : mongo.db();
      col = db.collection(COLLECTION);
    }

    let processed = 0;
    const concurrency = Math.max(1, CONCURRENCY);
    const queue = [];

    for (const prop of properties) {
      processed++;
      if (LIMIT_PROPERTIES && processed > LIMIT_PROPERTIES) break;

      // process with limited concurrency
      const p = (async () => {
        try {
          const res = await processProperty(prop, ftpClient);
          if (res.updated && !DRY_RUN && col) {
            await col.updateOne({ _id: prop._id }, { $set: { images: res.images } });
            console.log(`Updated DB for property ${prop._id}`);
          }
        } catch (e) {
          console.error('Property processing error', prop._id, e);
        }
      })();

      queue.push(p);
      if (queue.length >= concurrency) {
        await Promise.race(queue).catch(() => {});
        // remove settled
        for (let i = queue.length - 1; i >= 0; i--) {
          if (queue[i].isFulfilled || queue[i].isRejected) {
            queue.splice(i, 1);
          }
        }
        // simple cleanup: wait for any to finish and then continue
        await Promise.allSettled(queue.splice(0, queue.length));
      }
    }

    // wait remaining
    await Promise.allSettled(queue);

    console.log('Migration run complete');
  } catch (err) {
    console.error('Migration error', err);
  } finally {
    try { ftpClient.close(); } catch (e) {}
    if (mongo) await mongo.close();
  }
})();
