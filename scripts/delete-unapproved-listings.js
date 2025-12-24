const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Load .env manually if dotenv is not available
const envPath = path.resolve(process.cwd(), '.env');
if (!process.env.MONGODB_URI) {
  try {
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
  } catch (e) {
    // If .env not found, continue and rely on existing environment variables
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

async function deleteUnapproved() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const collection = mongoose.connection.collection('properties');
    const query = { $or: [{ isActive: false }, { isActive: { $exists: false } }] };
    console.log('Deleting documents matching:', JSON.stringify(query));

    const result = await collection.deleteMany(query);
    console.log(`Deleted ${result.deletedCount} unapproved listings.`);
  } catch (err) {
    console.error('Error during deletion:', err);
    process.exit(1);
  } finally {
    try { await mongoose.disconnect(); } catch (e) {}
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

deleteUnapproved();
