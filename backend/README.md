# Kanban Backend API

A comprehensive REST API for a Kanban-style task board application built with Express.js, MongoDB, and Socket.io.

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Workspaces**: Create and manage workspaces with member management
- **Boards**: Create boards within workspaces with customizable lists
- **Cards**: Full CRUD operations for task cards with drag & drop support
- **Real-time Updates**: Socket.io integration for live collaboration
- **User Management**: User registration, login, and profile management
- **Role-based Access**: Admin, member, and viewer roles for workspaces

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Real-time**: Socket.io
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/kanban-app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

3. **Start the server**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Get current user profile (requires authentication)

#### PUT `/api/auth/profile`
Update user profile (requires authentication)

#### POST `/api/auth/change-password`
Change user password (requires authentication)

### Workspaces

#### GET `/api/workspaces`
Get all workspaces for current user (requires authentication)

#### POST `/api/workspaces`
Create a new workspace (requires authentication)
```json
{
  "name": "My Workspace",
  "description": "Workspace description",
  "color": "#3B82F6",
  "isPublic": false
}
```

#### GET `/api/workspaces/:id`
Get workspace by ID (requires authentication)

#### PUT `/api/workspaces/:id`
Update workspace (requires authentication)

#### DELETE `/api/workspaces/:id`
Delete workspace (requires authentication)

#### POST `/api/workspaces/:id/members`
Add member to workspace (requires authentication)
```json
{
  "userId": "user_id_here",
  "role": "member"
}
```

#### DELETE `/api/workspaces/:id/members/:userId`
Remove member from workspace (requires authentication)

### Boards

#### GET `/api/boards`
Get all boards (optionally filtered by workspace) (requires authentication)

#### POST `/api/boards`
Create a new board (requires authentication)
```json
{
  "name": "My Board",
  "description": "Board description",
  "workspace": "workspace_id_here",
  "background": "#FFFFFF"
}
```

#### GET `/api/boards/:id`
Get board by ID with all cards (requires authentication)

#### PUT `/api/boards/:id`
Update board (requires authentication)

#### DELETE `/api/boards/:id`
Delete board (requires authentication)

#### POST `/api/boards/:id/lists`
Add a new list to board (requires authentication)
```json
{
  "name": "New List",
  "color": "#6B7280"
}
```

#### PUT `/api/boards/:id/lists/:listId`
Update a list in board (requires authentication)

#### DELETE `/api/boards/:id/lists/:listId`
Delete a list from board (requires authentication)

### Cards

#### GET `/api/cards`
Get all cards for a board (requires authentication)

#### POST `/api/cards`
Create a new card (requires authentication)
```json
{
  "title": "New Task",
  "description": "Task description",
  "board": "board_id_here",
  "list": "list_id_here",
  "dueDate": "2024-01-15T00:00:00.000Z",
  "priority": "medium",
  "assignedTo": ["user_id_1", "user_id_2"]
}
```

#### GET `/api/cards/:id`
Get card by ID (requires authentication)

#### PUT `/api/cards/:id`
Update card (requires authentication)

#### DELETE `/api/cards/:id`
Delete card (requires authentication)

#### PUT `/api/cards/:id/move`
Move card to different list/position (requires authentication)
```json
{
  "listId": "new_list_id",
  "order": 0
}
```

#### POST `/api/cards/:id/assign`
Assign user to card (requires authentication)
```json
{
  "userId": "user_id_here"
}
```

#### DELETE `/api/cards/:id/assign/:userId`
Unassign user from card (requires authentication)

#### POST `/api/cards/:id/comments`
Add comment to card (requires authentication)
```json
{
  "content": "This is a comment"
}
```

#### PUT `/api/cards/:id/complete`
Mark card as completed/incomplete (requires authentication)

## Socket.io Events

### Client to Server
- `join-board`: Join a board room
- `leave-board`: Leave a board room
- `card-moved`: Card moved to different list/position
- `card-created`: New card created
- `card-updated`: Card updated
- `card-deleted`: Card deleted

### Server to Client
- `card-updated`: Card moved by another user
- `card-added`: New card added by another user
- `card-modified`: Card modified by another user
- `card-removed`: Card removed by another user

## Database Models

### User
- username, email, password (hashed)
- avatar, timestamps
- Methods: comparePassword, toJSON

### Workspace
- name, description, owner, members
- color, isPublic, timestamps
- Member roles: admin, member, viewer

### Board
- name, description, workspace, owner
- lists (embedded), background, settings
- Default lists: To Do, Doing, Done

### Card
- title, description, board, list, order
- createdBy, assignedTo, dueDate, priority
- labels, comments, attachments
- isCompleted, completedAt, completedBy
- Methods: moveToList, addComment, assignUser, unassignUser

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: express-validator for all inputs
- **Rate Limiting**: Prevents abuse
- **CORS**: Configured for frontend
- **Helmet**: Security headers
- **Access Control**: Role-based permissions

## Error Handling

All endpoints return consistent error responses:
```json
{
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

## Development

### Project Structure
```
backend/
├── models/          # Mongoose models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

### Running Tests
```bash
npm test
```

### Code Style
- Use ES6+ features
- Follow REST API conventions
- Implement proper error handling
- Use async/await for database operations

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT_SECRET
3. Configure MongoDB connection string
4. Set up proper CORS origins
5. Use HTTPS in production
6. Implement logging and monitoring

## License

MIT License 