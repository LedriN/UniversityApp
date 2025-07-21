# University Student Management System - Backend

A robust Node.js/Express backend API with MongoDB for managing university students.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Student Management**: Full CRUD operations with advanced filtering
- **User Management**: Admin can manage staff users
- **Statistics**: Comprehensive dashboard statistics
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error handling and logging
- **Security**: Password hashing, JWT tokens, CORS protection

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

3. **Start MongoDB:**
Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

4. **Seed the database:**
```bash
npm run seed
```

5. **Start the server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Students
- `GET /api/students` - Get all students (with filtering)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user

### Statistics
- `GET /api/stats` - Get dashboard statistics

### Health Check
- `GET /api/health` - Server health status

## Query Parameters for Students

The `/api/students` endpoint supports the following query parameters:

- `search` - Text search in name, email, program
- `gender` - Filter by gender (M/F)
- `program` - Filter by program
- `paymentStatus` - Filter by payment status (paid/partial/unpaid)
- `location` - Filter by location (address contains)
- `ageRange` - Filter by age range (18-20/21-23/24+)

Example:
```
GET /api/students?search=andi&gender=M&program=Shkenca Kompjuterike
```

## Authentication

All endpoints except `/api/auth/login` and `/api/health` require authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Default Users

After running the seed script, you can login with:

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Staff User:**
- Username: `staff`
- Password: `staff123`

## Data Models

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (admin/staff),
  createdAt: Date,
  updatedAt: Date
}
```

### Student Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  parentName: String (required),
  gender: String (M/F, required),
  dateOfBirth: Date (required),
  address: String (required),
  phone: String (required, Albanian format),
  email: String (required, unique),
  previousSchool: String,
  previousSchoolAddress: String,
  program: String (required, enum),
  academicYear: String (required, YYYY-YYYY format),
  totalAmount: Number (required, min: 0),
  paidAmount: Number (required, min: 0),
  createdAt: Date,
  updatedAt: Date
}
```

## Available Programs

- Shkenca Kompjuterike
- Inxhinieri Civile
- Ekonomiks
- Drejtësi
- Mjekësi
- Psikologji
- Biznes dhe Menaxhim
- Arkitekturë

## Error Handling

The API returns consistent error responses:

```javascript
{
  "message": "Error description",
  "errors": [/* validation errors if applicable */]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a production MongoDB instance
3. Set a strong `JWT_SECRET`
4. Configure proper CORS settings
5. Use a process manager like PM2

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens have expiration times
- Input validation on all endpoints
- CORS protection configured
- Rate limiting recommended for production
- HTTPS recommended for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License