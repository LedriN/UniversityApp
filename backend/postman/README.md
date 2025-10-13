# Postman Collection for Update User Password

This collection contains requests for testing the user password update functionality.

## Setup Instructions

1. **Import the Collection**: Import `Update_User_Password.postman_collection.json` into Postman

2. **Set Environment Variables**:
   - `base_url`: Your API base URL (default: `http://localhost:5000`)
   - `admin_token`: JWT token for an admin user
   - `user_token`: JWT token for a regular user
   - `user_id`: ID of the user whose password you want to update
   - `current_user_id`: ID of the current user (for self-update scenarios)
   - `other_user_id`: ID of another user (for testing unauthorized access)

3. **Get Authentication Tokens**:
   - First, login as an admin user using the auth endpoint
   - Copy the JWT token from the response
   - Set it as the `admin_token` variable
   - Repeat for a regular user to get `user_token`

## Available Requests

### 1. Update User Password - Admin
- **Method**: PUT
- **URL**: `{{base_url}}/api/users/{{user_id}}/password`
- **Description**: Admin can update any user's password without providing current password
- **Body**: 
  ```json
  {
    "newPassword": "newSecurePassword123"
  }
  ```

### 2. Update Own Password - User
- **Method**: PUT
- **URL**: `{{base_url}}/api/users/{{current_user_id}}/password`
- **Description**: User updating their own password - requires current password
- **Body**:
  ```json
  {
    "currentPassword": "currentPassword123",
    "newPassword": "newSecurePassword123"
  }
  ```

### 3. Update Password - Validation Error
- **Method**: PUT
- **URL**: `{{base_url}}/api/users/{{user_id}}/password`
- **Description**: Test validation error with password too short
- **Body**:
  ```json
  {
    "newPassword": "123"
  }
  ```

### 4. Update Password - Unauthorized
- **Method**: PUT
- **URL**: `{{base_url}}/api/users/{{other_user_id}}/password`
- **Description**: Test unauthorized access - non-admin trying to update another user's password
- **Body**:
  ```json
  {
    "newPassword": "newSecurePassword123"
  }
  ```

## Expected Responses

### Success Response (200)
```json
{
  "message": "Password updated successfully"
}
```

### Validation Error (400)
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Password must be at least 6 characters long",
      "param": "newPassword",
      "location": "body"
    }
  ]
}
```

### Unauthorized (403)
```json
{
  "message": "Access denied. Admin privileges required"
}
```

### User Not Found (404)
```json
{
  "message": "User not found"
}
```

### Current Password Required (400)
```json
{
  "message": "Current password is required"
}
```

### Incorrect Current Password (400)
```json
{
  "message": "Current password is incorrect"
}
```

## Security Features

1. **Authentication Required**: All requests require a valid JWT token
2. **Role-based Access**: Only admins can update other users' passwords
3. **Current Password Verification**: Users must provide their current password when updating their own password
4. **Password Validation**: Minimum 6 characters required
5. **Password Hashing**: Passwords are automatically hashed using bcrypt before saving

## Testing Scenarios

1. **Admin Updates User Password**: Test that admin can update any user's password
2. **User Updates Own Password**: Test that users can update their own password with current password verification
3. **Validation**: Test password length validation
4. **Authorization**: Test that non-admin users cannot update other users' passwords
5. **Error Handling**: Test various error scenarios (user not found, invalid token, etc.)
