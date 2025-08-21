import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/construction_tracker"

async function setupAdmin() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("[v0] Connected to MongoDB")

    const db = client.db("construction_tracker")
    const users = db.collection("users")

    // Check if admin already exists
    const existingAdmin = await users.findOne({ role: "admin" })
    if (existingAdmin) {
      console.log("[v0] Admin user already exists:", existingAdmin.mobile)
      return
    }

    // Create default admin user
    const adminUser = {
      name: "System Administrator",
      mobile: "9999999999", // Default admin mobile number
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await users.insertOne(adminUser)
    console.log("[v0] Admin user created successfully!")
    console.log("[v0] Admin Mobile Number: 9999999999")
    console.log("[v0] User ID:", result.insertedId)
  } catch (error) {
    console.error("[v0] Error setting up admin:", error)
  } finally {
    await client.close()
  }
}

setupAdmin()
