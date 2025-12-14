# Multi-Tenant Project Management Platform

A simple, intern-friendly multi-tenant project management platform built with Next.js, NestJS, and Prisma.

## Features

- User authentication (email/password and Google OAuth)
- Multi-tenant architecture (Organizations)
- Role-based access control (Owner, Admin, Member, Guest)
- Project management
- Task management
- Simple commenting system

## Tech Stack

### Frontend
- Next.js 13+ (App Router)
- Tailwind CSS
- TypeScript

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- JWT for authentication

## Folder Structure

```
├── bacend/          # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── prisma/         # Prisma service
│   │   ├── rbac/           # Role-based access control
│   │   ├── guards/         # Custom guards
│   │   ├── projects/       # Projects controller
│   │   ├── tasks/          # Tasks controller
│   │   └── organizations/  # Organizations controller
│   └── prisma/             # Prisma schema and migrations
└── frontend/        # Next.js frontend
    ├── src/
    │   ├── app/            # App router pages
    │   ├── components/     # Reusable components
    │   ├── context/        # Auth context
    │   └── lib/            # Utility functions
```

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL database
- Google OAuth credentials (optional)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd bacend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/mtpmp
   JWT_SECRET=your_jwt_secret_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the backend server:
   ```bash
   npm run start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Visit `http://localhost:3000` in your browser

## Simplified Architecture

This implementation follows a simplified approach suitable for interns:

1. **Single Organization Per User**: Each user belongs to one organization
2. **Simple RBAC**: Roles are stored directly on the User model
3. **LocalStorage State**: Uses localStorage for simple state management
4. **Basic UI**: Clean, minimal interface with Tailwind CSS

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/google` - Google OAuth login
- `POST /auth/organization` - Create organization

### Organizations
- `GET /auth/organizations` - Get user's organizations
- `POST /auth/organization` - Create organization
- `GET /organizations/:id` - Get organization by ID
- `PUT /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Delete organization

### Projects
- `GET /projects` - Get all projects
- `GET /projects/:id` - Get project by ID
- `POST /projects` - Create project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Tasks
- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get task by ID
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

## Role Permissions

| Role   | Permissions |
|--------|-------------|
| OWNER  | Full access to organization, projects, and tasks |
| ADMIN  | Manage projects and tasks, add/remove members |
| MEMBER | Create and update projects and tasks |
| GUEST  | View only access |

## Development Notes

This implementation is designed to be:
- Simple to understand
- Easy to extend
- Suitable for learning RBAC concepts
- Practical for intern-level developers

The code avoids complex patterns and focuses on clarity over cleverness.