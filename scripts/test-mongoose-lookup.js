const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

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

// Define minimal schema to avoid importing the whole app structure
const PropertySchema = new mongoose.Schema({
    title: String,
    slug: String,
    isActive: Boolean,
    isApprovedByAdmin: Boolean
}, { strict: false });

const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const id = '694caf39497bcd6dbc64bdaf'; // Use one of the IDs found earlier
        console.log(`Looking up ID: ${id}`);

        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        console.log(`isObjectId: ${isObjectId}`);

        let property = null;
        if (isObjectId) {
            property = await Property.findById(id).lean();
        }

        if (!property) {
            console.log('Not found by ID, trying slug...');
            property = await Property.findOne({ slug: id }).lean();
        }

        if (property) {
            console.log('Found property:', property);
        } else {
            console.log('Property NOT found.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
