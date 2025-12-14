# Complete User Workflow

This document explains the complete workflow for the multi-tenant project management platform.

## 1. User Registration/Login

### Option A: Email/Password Registration
1. User visits `/auth/register`
2. Enters name, email, and password
3. System creates user account
4. Automatically logs user in

### Option B: Google OAuth Login
1. User visits `/auth/login`
2. Clicks "Login with Google"
3. Redirected to Google OAuth
4. After authentication, redirected back to app

## 2. Organization Creation/Membership

### If User is NOT part of any organization:
1. Redirected to dashboard
2. Shown "Create Organization" form
3. User enters organization name
4. System creates organization
5. User becomes OWNER of organization automatically

### If User IS part of an organization:
1. Redirected to dashboard
2. Shows projects from their organization
3. Can start working immediately

## 3. Project & Task Management

### Creating Projects:
1. From dashboard, click "Create Project"
2. Enter project name and description
3. Project is created in user's organization

### Creating Tasks:
1. Click on a project to view details
2. Click "Add New Task"
3. Enter task title and description
4. Task is created within the project

### Working with Tasks:
1. Click on a task to view details
2. Add comments to tasks
3. View task details (status, priority, etc.)

## 4. Member Management (OWNER/ADMIN only)

### Inviting Members:
1. OWNER/ADMIN clicks "Manage Members" on dashboard
2. Enters email address and selects role (MEMBER/ADMIN)
3. System generates invitation token
4. Displays token to share with invited user

### Accepting Invitations:
1. Invited user logs in to the system
2. Visits `/accept-invitation?token=[INVITATION_TOKEN]`
3. System adds user to organization with specified role
4. User can now access organization's projects and tasks

### Managing Members:
1. OWNER/ADMIN can view current members
2. (Future enhancement) Remove members or change roles

## 5. Organization Settings (OWNER only)

### Updating Organization:
1. OWNER clicks "Settings" in header
2. Can update organization name
3. Changes are saved to database

## Role-Based Access Control

| Role   | Permissions |
|--------|-------------|
| OWNER  | Create organization, invite members, manage members, create/edit/delete all projects/tasks, change organization settings |
| ADMIN  | Invite members, manage members, create/edit/delete all projects/tasks |
| MEMBER | Create/edit own projects/tasks, view all projects/tasks, add comments |
| GUEST  | View only access (limited in current implementation) |

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

### Members & Invitations
- `POST /invitations` - Create invitation (OWNER/ADMIN)
- `GET /invitations/:token/accept` - Accept invitation

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

## Data Flow Summary

1. **User Authentication** → JWT tokens stored in localStorage
2. **Organization Context** → Organization ID stored in localStorage and sent as `x-org-id` header
3. **Role Checking** → User role checked for each action
4. **Data Isolation** → All data scoped to user's organization
5. **Invitation System** → Token-based member onboarding

This workflow provides a complete, functional multi-tenant project management platform that satisfies all the user stories while keeping the implementation simple enough for intern-level developers to understand and extend.