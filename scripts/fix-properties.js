const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

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

    const propertyIds = [
      '694daf1580239e0639cee23f',
      '694db94a1f1098c27a6f3f69'
    ];

    console.log('Adding missing required fields to properties...\n');

    for (const id of propertyIds) {
      const property = await col.findOne({ _id: new ObjectId(id) });

      if (!property) {
        console.log(`Property ${id} not found`);
        continue;
      }

      console.log(`Updating property: ${property.title}`);

      // Add missing required fields with default values
      const updates = {};

      if (!property.description) {
        updates.description = property.title + ' - A beautiful property in Dubai.';
      }

      if (!property.propertyType) {
        updates.propertyType = 'apartment';
      }

      if (property.bedrooms === undefined || property.bedrooms === null) {
        updates.bedrooms = 2;
      }

      if (property.bathrooms === undefined || property.bathrooms === null) {
        updates.bathrooms = 2;
      }

      if (property.guests === undefined || property.guests === null) {
        updates.guests = 4;
      }

      if (!property.location) {
        updates.location = {
          address: 'Business Bay, Dubai',
          area: 'Business Bay',
          city: 'Dubai',
          country: 'UAE'
        };
      }

      if (!property.images || property.images.length === 0) {
        updates.images = ['/placeholder.jpg'];
      }

      if (!property.amenities) {
        updates.amenities = ['WiFi', 'Air Conditioning', 'Kitchen'];
      }

      if (property.pricePerNight === undefined || property.pricePerNight === null) {
        updates.pricePerNight = 500;
      }

      if (property.reviewCount === undefined || property.reviewCount === null) {
        updates.reviewCount = 0;
      }

      console.log('Updates:', JSON.stringify(updates, null, 2));

      await col.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );

      console.log(`✓ Updated ${id}\n`);
    }

    console.log('All properties updated. Verifying...');

    // Verify the updates
    for (const id of propertyIds) {
      const property = await col.findOne({ _id: new ObjectId(id) });
      console.log(`\n${id}:`);
      console.log(`  Title: ${property.title}`);
      console.log(`  Description: ${property.description ? '✓' : '✗'}`);
      console.log(`  Property Type: ${property.propertyType || '✗'}`);
      console.log(`  Bedrooms: ${property.bedrooms || '✗'}`);
      console.log(`  Bathrooms: ${property.bathrooms || '✗'}`);
      console.log(`  Guests: ${property.guests || '✗'}`);
      console.log(`  Location: ${property.location ? '✓' : '✗'}`);
      console.log(`  Images: ${property.images && property.images.length > 0 ? '✓' : '✗'}`);
      console.log(`  Amenities: ${property.amenities && property.amenities.length > 0 ? '✓' : '✗'}`);
    }

  } finally {
    await client.close();
  }
})();