# Task-managment

# Task Management API

A RESTful API for managing tasks with MongoDB, built with Node.js and Express.

## Features

- User registration and authentication with JWT
- CRUD operations for tasks
- Advanced filtering, sorting, and pagination
- Rate limiting and caching
- Audit logging
- Full-text search 
- Dockerized for easy deployment

## Project Structure

```
task-management-api/
│
├── config/
│   ├── db.js             # Database connection setup
│   └── config.js         # Configuration variables
│
├── controllers/
│   ├── authController.js # Authentication logic
│   └── taskController.js # Task management logic
│
├── middleware/
│   ├── authMiddleware.js  # JWT authentication middleware
│   ├── cacheMiddleware.js # Request caching middleware
│   └── rateLimit.js       # Rate limiting middleware
│
├── models/
│   ├── Task.js            # Task data model
│   ├── User.js            # User data model
│   └── AuditLog.js        # Audit log data model
│
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   └── taskRoutes.js      # Task management routes
│
├── utils/
│   └── logger.js          # Logging utility
│
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore file
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── package.json           # Node.js dependencies
├── README.md              # Project documentation
└── server.js              # Entry point
```

## Tech Stack

- Node.js & Express
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- Winston for logging
- Node-cache for caching
- Docker & Docker Compose

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Authenticate user and get token

### Tasks

- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get all tasks with filtering and pagination
- `GET /api/tasks/:id` - Get a specific task by ID
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
4. For development with auto-reload:
   ```
   npm run dev
   ```

### Docker Setup

1. Build and start the containers:
   ```
   docker-compose up -d
   ```
2. The API will be available at http://localhost:3000

## Example Requests

### Register User
```
POST /api/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### Login
```
POST /api/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

### Create Task
```
POST /api/tasks
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "title": "Complete backend API",
  "description": "Finish the development of the backend REST API.",
  "status": "Pending",
  "dueDate": "2025-02-25T00:00:00Z"
}
```

### Get Tasks with Filters
```
GET /api/tasks?status=Pending&due_date_after=2025-02-20&sort_by=due_date&sort_order=asc&page=1&limit=5
Authorization: Bearer <your_jwt_token>
```

## Testing

Run tests with:
```
npm test
```

## License

MIT