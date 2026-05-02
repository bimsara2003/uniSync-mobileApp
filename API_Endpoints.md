# UniSync API Endpoints Documentation

This document outlines the API endpoints available in the UniSync platform.

## 1. Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Authenticate user & get tokens | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/logout` | Logout user & clear refresh token | Public |
| POST | `/api/auth/forgotpassword` | Request password reset email | Public |
| PUT | `/api/auth/resetpassword` | Reset password with token | Public |
| GET | `/api/auth/profile` | Get logged-in user profile | User |
| PUT | `/api/auth/profile` | Update user profile | User |
| DELETE | `/api/auth/profile` | Delete user profile | User |
| POST | `/api/auth/profile/photo` | Upload profile photo | User |
| DELETE | `/api/auth/profile/photo` | Delete profile photo | User |
| PUT | `/api/auth/change-password` | Change password for logged-in user | User |

## 2. Announcement Routes (`/api/announcements`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/announcements` | Get all announcements | User |
| GET | `/api/announcements/:id` | Get announcement by ID | User |
| POST | `/api/announcements` | Create a new announcement | Staff/Admin |
| PUT | `/api/announcements/:id` | Update an announcement | Staff/Admin |
| DELETE | `/api/announcements/:id` | Delete an announcement | Staff/Admin |
| PATCH | `/api/announcements/:id/pin` | Toggle pin status | Staff/Admin |
| DELETE | `/api/announcements/:id/attachments/:attachmentId` | Delete specific attachment | Staff/Admin |

## 3. Hierarchy Routes (Faculties, Departments, Modules)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/faculties` | Get all faculties | Public |
| POST | `/api/faculties` | Create a new faculty | Admin |
| GET | `/api/departments` | Get all departments | User |
| POST | `/api/departments` | Create a new department | Admin |
| GET | `/api/modules` | Get all modules | User |
| POST | `/api/modules` | Create a new module | Admin |

## 4. Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/admin/users` | Get all registered users | Admin |
| PUT | `/api/admin/users/:id/deactivate` | Deactivate a user account | Admin |
| DELETE | `/api/admin/users/:id` | Permanently delete a user | Admin |

## 5. Resource Routes (`/api/resources`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/resources` | Upload a new resource | User |
| GET | `/api/resources` | Get all approved resources | User |
| GET | `/api/resources/pending` | Get pending resources for approval | User |
| GET | `/api/resources/bookmarks` | Get user's bookmarked resources | User |
| GET | `/api/resources/:id` | Get resource details | User |
| GET | `/api/resources/:id/download` | Download resource file | User |
| PUT | `/api/resources/:id/approve` | Approve a pending resource | Admin |
| PUT | `/api/resources/:id/reject` | Reject a pending resource | Admin |
| POST | `/api/resources/:id/bookmark` | Toggle resource bookmark | User |
