require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function seedAdmin() {
  const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGO_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      'Missing required environment variables: MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD'
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);

    const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();
    const existingAdmin = await User.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      console.log(`Admin already exists for ${ADMIN_EMAIL}. Skipping.`);
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: normalizedEmail,
        password: ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log(`Admin account created for ${ADMIN_EMAIL}.`);
    }
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedAdmin();
}

module.exports = { seedAdmin };
