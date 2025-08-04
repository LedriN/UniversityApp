# Email Setup Guide

This guide will help you set up email functionality for the University Management System.

## Prerequisites

1. A Gmail account (or other email provider)
2. App password for your email account

## Setup Steps

### 1. Create .env file

Create a `.env` file in the backend directory with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/university_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration for Nodemailer
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 2. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to your Google Account settings
   - Navigate to Security
   - Under "2-Step Verification", click on "App passwords"
   - Generate a new app password for "Mail"
   - Use this password in your `.env` file

### 3. Other Email Providers

If you want to use a different email provider, modify the `createTransporter` function in `utils/emailService.js`:

```javascript
// For Outlook/Hotmail
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// For Yahoo
const transporter = nodemailer.createTransporter({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// For custom SMTP
const transporter = nodemailer.createTransporter({
  host: 'smtp.yourprovider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

## How It Works

When a new student is added to the system:

1. A random 16-character password is generated
2. A user account is created with the generated password
3. A welcome email is sent to the student's email address containing:
   - Username (firstname.lastname)
   - Generated password
   - Email address
   - Security instructions

## Testing

To test the email functionality:

1. Make sure your `.env` file is properly configured
2. Start the backend server
3. Add a new student through the admin interface
4. Check the student's email for the welcome message

## Troubleshooting

### Common Issues

1. **"Invalid login" error**: Make sure you're using an app password, not your regular Gmail password
2. **"Less secure app access"**: Enable 2-factor authentication and use app passwords
3. **Email not sending**: Check your internet connection and email provider settings

### Debug Mode

To enable debug mode for nodemailer, add this to your `.env` file:

```env
EMAIL_DEBUG=true
```

And modify the `createTransporter` function:

```javascript
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: process.env.EMAIL_DEBUG === 'true',
    logger: process.env.EMAIL_DEBUG === 'true'
  });
};
```

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords instead of your main password
- Regularly rotate your app passwords
- Consider using environment-specific email accounts for testing 