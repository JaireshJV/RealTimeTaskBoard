# Kanban Frontend

A modern, responsive React application for managing Kanban boards with real-time collaboration features.

## Features

- **Modern UI**: Built with React 19, Tailwind CSS, and Lucide React icons
- **State Management**: Redux Toolkit for predictable state management
- **Real-time Updates**: Socket.io integration for live collaboration
- **Drag & Drop**: Smooth drag and drop functionality with react-beautiful-dnd
- **Authentication**: JWT-based authentication with protected routes
- **Responsive Design**: Mobile-first design that works on all devices
- **Theme Support**: Light/dark theme with persistent preferences
- **Form Validation**: Client-side validation with error handling
- **Notifications**: Toast notifications for user feedback

## Tech Stack

- **Framework**: React 19
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Drag & Drop**: react-beautiful-dnd
- **Real-time**: Socket.io Client
- **Date Handling**: date-fns
- **Utilities**: clsx

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Sidebar, Header, etc.)
│   ├── UI/             # Generic UI components (LoadingSpinner, etc.)
│   ├── Board/          # Board-related components
│   ├── Card/           # Card-related components
│   └── Workspace/      # Workspace-related components
├── pages/              # Page components
│   ├── Auth/           # Authentication pages
│   ├── Dashboard/      # Dashboard page
│   ├── Board/          # Board page
│   ├── Workspace/      # Workspace page
│   └── Profile/        # User profile page
├── store/              # Redux store configuration
│   ├── slices/         # Redux slices
│   └── index.js        # Store configuration
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── services/           # API service functions
└── App.js              # Main App component
```

## Key Components

### Layout Components

- **Layout**: Main layout wrapper with sidebar and header
- **AuthLayout**: Layout for authentication pages
- **Sidebar**: Navigation sidebar with workspaces and boards
- **Header**: Top header with user menu and actions

### UI Components

- **LoadingSpinner**: Reusable loading spinner
- **NotificationContainer**: Toast notification system
- **Modal**: Reusable modal component
- **Button**: Styled button component
- **Input**: Styled input component

### Board Components

- **BoardView**: Main board view with lists and cards
- **List**: Individual list component
- **Card**: Individual card component
- **CardModal**: Card details modal
- **CreateCardModal**: Modal for creating new cards

### Workspace Components

- **WorkspaceList**: List of workspaces
- **WorkspaceCard**: Individual workspace card
- **CreateWorkspaceModal**: Modal for creating workspaces

## State Management

The application uses Redux Toolkit for state management with the following slices:

### Auth Slice
- User authentication state
- Login/logout functionality
- User profile management

### Workspace Slice
- Workspace CRUD operations
- Workspace member management
- Current workspace state

### Board Slice
- Board CRUD operations
- List management
- Current board state

### Card Slice
- Card CRUD operations
- Drag and drop state
- Real-time updates

### UI Slice
- Modal states
- Loading states
- Notifications
- Theme preferences
- Sidebar state

## Routing

The application uses React Router with the following routes:

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Main dashboard
- `/workspace/:id` - Workspace view
- `/board/:id` - Board view
- `/profile` - User profile

## Real-time Features

The application integrates with Socket.io for real-time updates:

- **Card Movement**: Real-time updates when cards are moved
- **Card Creation**: Live updates when new cards are created
- **Card Updates**: Real-time updates when cards are modified
- **Card Deletion**: Live updates when cards are deleted

## Styling

The application uses Tailwind CSS with a custom design system:

- **Colors**: Primary color palette with semantic colors
- **Components**: Pre-built component classes
- **Animations**: Custom animations for smooth interactions
- **Responsive**: Mobile-first responsive design

## Development

### Code Style
- Use functional components with hooks
- Follow React best practices
- Use TypeScript-like prop validation
- Implement proper error boundaries

### Testing
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_SOCKET_URL`: Socket.io server URL

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with React.lazy
- Optimized bundle size
- Efficient re-renders with React.memo
- Debounced API calls
- Optimistic updates for better UX

## Security

- JWT token management
- Protected routes
- Input validation
- XSS prevention
- CSRF protection

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your hosting service

3. Configure environment variables in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
