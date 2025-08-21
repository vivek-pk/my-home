# Construction Project Tracker

A comprehensive construction project management system with role-based access control.

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env.local` and configure:
\`\`\`bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
\`\`\`

### 2. Create Initial Admin User
Run the setup script to create the first admin user:
\`\`\`bash
npm run setup-admin
\`\`\`

This creates an admin user with mobile number: **9999999999**

### 3. Login as Admin
1. Go to `/login`
2. Enter mobile number: `9999999999`
3. You'll be redirected to the admin dashboard at `/admin`

### 4. Create Additional Users
Once logged in as admin, you can create additional users through:
- Admin Dashboard → Users → Create User

## User Roles
- **Admin**: Full system access, user management, project creation
- **Manager**: Project oversight, timeline updates, team coordination  
- **Engineer**: Technical updates, progress reporting, material management
- **Homeowner**: View-only access to their project progress

## Authentication
- Mobile number-based authentication (no passwords required)
- JWT tokens with 7-day expiration
- Role-based access control and automatic redirects
