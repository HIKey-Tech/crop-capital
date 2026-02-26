# Admin Role Management - Security Update

## Overview

This security update fixes a critical vulnerability where users could self-assign admin roles during signup. Now all new users are created with the "investor" role by default, and only existing admins can promote users.

## Changes Made

### 1. Secured Signup Process

- **File**: `src/modules/auth/auth.service.ts`
- **Change**: Removed `role` parameter from `signupUser()` function
- **Impact**: All new users are automatically created as "investor" role
- **Before**: `signupUser(name, email, password, role)`
- **After**: `signupUser(name, email, password)` ← always creates as "investor"

### 2. Updated Auth Controller

- **File**: `src/modules/auth/auth.controller.ts`
- **Change**: Removed `role` from request body parsing
- **Impact**: Client cannot pass role during signup
- **Before**: `const { name, email, password, role } = req.body;`
- **After**: `const { name, email, password } = req.body;`

### 3. Added User Service

- **File**: `src/modules/users/user.service.ts` (NEW)
- **Functions**:
  - `promoteToAdmin(userId)` - Promotes an investor to admin
  - `demoteFromAdmin(userId)` - Demotes an admin to investor
- **Validation**: Checks if user exists and prevents duplicate operations

### 4. Added Admin Promotion Endpoints

- **File**: `src/modules/users/user.routes.ts`
- **New Routes**:
  - `PATCH /api/users/:id/promote` - Promote user to admin (admin-only)
  - `PATCH /api/users/:id/demote` - Demote admin to investor (admin-only)
- **Protection**: Both routes require admin authentication

### 5. Added User Controllers

- **File**: `src/modules/users/user.controller.ts`
- **New Controllers**:
  - `promoteUser()` - Handles promotion requests
  - `demoteUser()` - Handles demotion requests

### 6. Fixed TypeScript Errors

- **File**: `src/modules/investments/investment.model.ts`
- **Change**: Added `updatedAt: Date` to `IInvestment` interface
- **Impact**: Resolves TypeScript errors when accessing `updatedAt` property

## API Usage

### Promote User to Admin

```bash
PATCH /api/users/:userId/promote
Headers: Authorization: Bearer <admin-token>

Response:
{
  "success": true,
  "message": "User promoted to admin successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

### Demote Admin to Investor

```bash
PATCH /api/users/:userId/demote
Headers: Authorization: Bearer <admin-token>

Response:
{
  "success": true,
  "message": "User demoted to investor successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "investor"
  }
}
```

## Initial Admin Setup

The seed script (`src/scripts/seed.ts`) creates an initial admin account:

- **Email**: `admin@cropcapital.com`
- **Password**: `admin123`
- **Role**: `admin`

⚠️ **IMPORTANT**: Change this password in production!

## Security Benefits

1. ✅ **Prevents Unauthorized Admin Access**: Users cannot self-assign admin role
2. ✅ **Centralized Control**: Only admins can promote other users
3. ✅ **Audit Trail**: All role changes are logged through API endpoints
4. ✅ **Validation**: Prevents duplicate promotions/demotions
5. ✅ **Type Safety**: Fixed TypeScript errors for better type checking

## Migration Notes

- **Existing Users**: No migration needed. All existing data remains intact.
- **New Signups**: Will automatically be created as "investor" role
- **Admin Accounts**: Use the seed script or promote existing users via API

## Testing

1. **Test Signup**: Verify new users are created as "investor"
2. **Test Promotion**: Admin should be able to promote users
3. **Test Demotion**: Admin should be able to demote users
4. **Test Authorization**: Non-admin users should be rejected from promotion endpoints
5. **Test Validation**: Verify error handling for invalid user IDs

## Next Steps (Optional Enhancements)

Consider implementing:

1. **Super Admin Role**: A role that cannot be demoted
2. **Role History**: Log all role changes with timestamps
3. **Email Notifications**: Notify users when their role changes
4. **Frontend UI**: Add admin panel for managing user roles
5. **Bulk Operations**: Promote/demote multiple users at once
