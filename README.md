# University Student Management System

A comprehensive web application for managing university students with MongoDB backend integration.

## Features

- **Student Management**: Add, edit, view, and delete student records
- **Advanced Filtering**: Search and filter students by various criteria
- **Payment Tracking**: Automatic calculation of payment status and debt
- **PDF Export**: Export student data to PDF format
- **User Management**: Role-based access control (Admin/Staff)
- **Dashboard**: Overview statistics and recent activities
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend Integration**: Axios for API calls
- **PDF Generation**: jsPDF
- **Icons**: Lucide React
- **Build Tool**: Vite

## Setup Instructions

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the API URL in `.env`:
```
VITE_API_BASE_URL=http://your-backend-url/api
```

4. Start development server:
```bash
npm run dev
```

### Backend API Requirements

The application expects a REST API with the following endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout  
- `GET /api/auth/me` - Get current user

#### Students
- `GET /api/students` - Get all students (with filtering)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

#### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user

#### Statistics
- `GET /api/stats` - Get dashboard statistics

### Expected Data Models

#### Student Model
```typescript
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  parentName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  address: string;
  phone: string;
  email: string;
  previousSchool: string;
  previousSchoolAddress: string;
  program: string;
  academicYear: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
}
```

#### User Model
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  createdAt: string;
}
```

### Authentication

The application uses JWT tokens for authentication. The token should be returned from the login endpoint and will be automatically included in subsequent API requests.

### Error Handling

The application includes comprehensive error handling for:
- Network errors
- Authentication failures
- Validation errors
- Server errors

### Demo Credentials

For testing purposes, you can use these demo credentials:
- Username: `admin`
- Password: `admin123`

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider

3. Make sure your backend API is accessible from the deployed frontend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.