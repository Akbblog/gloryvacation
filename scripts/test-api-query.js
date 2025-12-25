const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// load .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

const loadEnv = (p) => {
  if (fs.existsSync(p)) {
    const env = fs.readFileSync(p, 'utf8');
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
};

loadEnv(envPath);
loadEnv(envLocalPath); // Override with local

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}

(async () => {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const col = db.collection('properties');

    console.log('Testing the query used in the API...');

    // This is the query used in the API
    const query = {
      isActive: true,
      $or: [
        { isApprovedByAdmin: true },
        { isApprovedByAdmin: { $exists: false } }
      ]
    };

    console.log('Query:', JSON.stringify(query, null, 2));

    const properties = await col.find(query).toArray();

    console.log(`\nFound ${properties.length} properties with the API query:\n`);
    properties.forEach((p, i) => {
      console.log(`${i+1}. ${p._id} - ${p.title}`);
      console.log(`   isActive: ${p.isActive}, isApprovedByAdmin: ${p.isApprovedByAdmin}`);
    });

  } finally {
    await client.close();
  }
})();