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

    const all = await col.find({}, { 
      projection: { 
        _id: 1, 
        title: 1, 
        slug: 1, 
        isActive: 1, 
        isApprovedByAdmin: 1,
        createdAt: 1 
      } 
    }).sort({ createdAt: -1 }).limit(20).toArray();

    console.log(`\nFound ${all.length} properties (last 20):\n`);
    all.forEach((p, i) => {
      console.log(`${i+1}. ${p._id}`);
      console.log(`   Title: ${p.title || '(no title)'}`);
      console.log(`   Slug: ${p.slug || '(no slug)'}`);
      console.log(`   isActive: ${p.isActive}, isApprovedByAdmin: ${p.isApprovedByAdmin}`);
      console.log(`   Created: ${p.createdAt}`);
      console.log('');
    });

    // Count by status
    const activeCount = await col.countDocuments({ isActive: true });
    const inactiveCount = await col.countDocuments({ isActive: false });
    const approvedCount = await col.countDocuments({ isApprovedByAdmin: true });
    const unapprovedCount = await col.countDocuments({ isApprovedByAdmin: false });
    const totalCount = await col.countDocuments({});

    console.log('--- Summary ---');
    console.log(`Total: ${totalCount}`);
    console.log(`Active: ${activeCount}, Inactive: ${inactiveCount}`);
    console.log(`Approved: ${approvedCount}, Unapproved: ${unapprovedCount}`);

  } finally {
    await client.close();
  }
})();
