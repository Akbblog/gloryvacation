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

const PropertySchema = new mongoose.Schema({
    title: String,
    slug: String,
    description: String,
    propertyType: String,
    bedrooms: Number,
    bathrooms: Number,
    guests: Number,
    pricePerNight: Number,
    images: [String],
    amenities: [String],
    location: {
        address: String,
        area: String,
        city: String,
        country: String
    },
    host: mongoose.Schema.Types.ObjectId,
    isActive: Boolean,
    isApprovedByAdmin: Boolean
}, { strict: false });

const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        
        // Check if test property exists
        const existing = await Property.findOne({ slug: 'test-property-123' });
        if (existing) {
            console.log('Test property already exists:', existing._id);
            return;
        }

        // Create a dummy host ID (or use existing if known, but random ObjectId works for creation usually if not populated strictly)
        // Better to find a user
        const UserSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        const user = await User.findOne();
        const hostId = user ? user._id : new mongoose.Types.ObjectId();

        const prop = await Property.create({
            title: 'Test Property',
            slug: 'test-property-123',
            description: 'This is a test property',
            propertyType: 'apartment',
            bedrooms: 1,
            bathrooms: 1,
            guests: 2,
            pricePerNight: 100,
            images: [],
            amenities: ['Wifi'],
            location: {
                address: 'Test Address',
                area: 'Test Area',
                city: 'Dubai',
                country: 'UAE'
            },
            host: hostId,
            isActive: true,
            isApprovedByAdmin: true
        });

        console.log('Created test property:', prop._id);
        console.log('Slug:', prop.slug);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
