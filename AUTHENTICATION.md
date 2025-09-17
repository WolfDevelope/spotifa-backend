# Authentication System Documentation

## Overview
This document outlines the authentication system implemented for the Spotifa music streaming platform. The system includes user registration, email verification, login, password reset, and account management features.

## Features

### 1. User Registration
- Email and username validation
- Password strength requirements
- Email verification
- Role-based access control (user, artist, admin)

### 2. Email Verification
- Secure token-based verification
- 24-hour expiration
- Resend verification email functionality

### 3. Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Account lockout after multiple failed attempts
- Rate limiting for login attempts

### 4. Password Management
- Secure password reset flow
- Token-based password reset with expiration
- Password update functionality for logged-in users

### 5. Account Security
- Session management
- JWT token expiration
- Secure cookie settings
- CSRF protection

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Email Verification
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email

### Password Management
- `POST /api/auth/forgot-password` - Request password reset
- `PATCH /api/auth/reset-password/:token` - Reset password
- `PATCH /api/auth/update-password` - Update password (requires auth)

### Account Management
- `PATCH /api/auth/update-me` - Update profile
- `DELETE /api/auth/delete-me` - Delete account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=30d
JWT_COOKIE_EXPIRES_IN=30

# Email Configuration
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your_email_username
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=Spotifa <noreply@spotifa.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Security Considerations

1. **Passwords**
   - Passwords are hashed using bcrypt before being stored
   - Minimum 8 characters required
   - Passwords are never sent in response bodies

2. **JWT Tokens**
   - Tokens expire after 30 days
   - Stored in HTTP-only cookies for web clients
   - Include user ID and role

3. **Rate Limiting**
   - 100 requests per 15 minutes per IP for auth routes
   - Account lockout after 5 failed login attempts

4. **Email Verification**
   - Required before accessing protected routes
   - Verification links expire after 24 hours

## Error Handling

The API returns appropriate HTTP status codes and error messages. Common error responses include:

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Testing

To test the authentication system, you can use tools like Postman or cURL to make requests to the API endpoints. Make sure to:

1. Register a new user
2. Verify the email address
3. Login to get a JWT token
4. Use the token to access protected routes

## Dependencies

- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT implementation
- `nodemailer` - Email sending
- `pug` - Email templates
- `html-to-text` - Convert HTML emails to plain text
- `mongoose` - MongoDB ODM
- `express` - Web framework

## Future Improvements

1. Implement Two-Factor Authentication (2FA)
2. Add social login (Google, Facebook, etc.)
3. Implement refresh tokens
4. Add account activity logging
5. Implement IP-based security features
