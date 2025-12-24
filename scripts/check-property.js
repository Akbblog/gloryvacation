const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/check-property.js <id-or-slug>');
    process.exit(1);
  }
  const id = args[0];

  // Read .env.local
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found');
    process.exit(2);
  }
  const env = fs.readFileSync(envPath, 'utf8');
  const m = env.match(/^MONGODB_URI=(.*)$/m);
  if (!m) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(3);
  }
  const uri = m[1].trim();

  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(uri, { maxPoolSize: 5 });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message || err);
    process.exit(4);
  }

  const Property = mongoose.model('Property', new mongoose.Schema({}, { strict: false }), 'properties');

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
  let doc = null;
  try {
    if (isObjectId) {
      doc = await Property.findById(id).lean();
    }
    if (!doc) {
      doc = await Property.findOne({ slug: id }).lean();
    }
  } catch (err) {
    console.error('Query error:', err.message || err);
    process.exit(5);
  }

  if (!doc) {
    console.log('Property not found');
    process.exit(0);
  }

  console.log('Property:');
  console.log(JSON.stringify(doc, null, 2));
  await mongoose.disconnect();
  process.exit(0);
}

main();
