const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

// load .env manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!m) return;
    let key = m[1];
    let value = m[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    process.env[key] = value;
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}

const idArg = process.argv[2];
if (!idArg) {
  console.error('Usage: node scripts/query-property.js <id-or-slug>');
  process.exit(1);
}

(async () => {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const col = db.collection('properties');

    let query;
    if (/^[0-9a-fA-F]{24}$/.test(idArg)) {
      query = { _id: new ObjectId(idArg) };
    } else {
      query = { slug: idArg };
    }

    const doc = await col.findOne(query);
    if (!doc) {
      console.log('Property not found for', idArg);
      process.exit(0);
    }

    console.log('Found property:');
    console.log(JSON.stringify({ _id: doc._id, title: doc.title, slug: doc.slug, isActive: doc.isActive, host: doc.host, createdAt: doc.createdAt }, null, 2));
  } catch (e) {
    console.error('Error querying property:', e);
  } finally {
    await client.close();
  }
})();
