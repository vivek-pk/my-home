import { MongoClient } from 'mongodb';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/construction_tracker';

async function setupAdmin() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('[v0] Connected to MongoDB');

    const db = client.db('construction_tracker');
    const users = db.collection('users');

    // Check if admin already exists
    const existingAdmin = await users.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('[v0] Admin user already exists:', existingAdmin.mobile);
      return;
    }

    // Create default admin user
    const adminUser = {
      name: 'System Administrator',
      mobile: '9999999999', // Default admin mobile number
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(adminUser);
    console.log('[v0] Admin user created successfully!');
    console.log('[v0] Admin Mobile Number: 9999999999');
    console.log('[v0] User ID:', result.insertedId);
  } catch (error) {
    console.error('[v0] Error setting up admin:', error);
  } finally {
    await client.close();
  }
}

async function deleteUserByMobile(mobile) {
  if (!mobile) {
    console.error(
      '[v0] Provide mobile to delete: node scripts/setup-admin.js --delete <mobile>'
    );
    return;
  }
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('construction_tracker');
    const users = db.collection('users');
    const user = await users.findOne({ mobile });
    if (!user) {
      console.log('[v0] No user found with mobile:', mobile);
      return;
    }
    if (user.role === 'admin') {
      const adminCount = await users.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        console.log('[v0] Cannot delete the last admin user.');
        return;
      }
    }
    await users.deleteOne({ _id: user._id });
    console.log(`[v0] Deleted user (${user.role}) mobile: ${mobile}`);
  } catch (error) {
    console.error('[v0] Error deleting user:', error);
  } finally {
    await client.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--delete') {
    await deleteUserByMobile(args[1]);
    return;
  }
  await setupAdmin();
}

main();
