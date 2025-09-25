# Employee Task Manager - React Frontend

A modern React frontend for the Employee Task Manager API, built with Material-UI and TypeScript.

## Features

- **Authentication**: JWT-based login with persistent sessions
- **Employee Management**: Complete CRUD operations with responsive cards
- **Task Management**: Task creation, assignment, and status updates
- **Responsive Design**: Mobile-friendly interface using Material-UI
- **Real-time Updates**: Instant status changes and data synchronization
- **Form Validation**: Client-side validation with error handling
- **Date/Time Picker**: Advanced date selection for task due dates

## Technology Stack

- **React 19** - Modern React with hooks
- **TypeScript** - Type safety and better developer experience
- **Material-UI (MUI)** - Professional UI components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Day.js** - Date manipulation and formatting
- **Vite** - Fast build tool and dev server

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main app layout with navigation
│   └── ProtectedRoute.tsx # Route protection wrapper
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── pages/              # Page components
│   ├── LoginPage.tsx   # Login form
│   ├── EmployeePage.tsx # Employee management
│   └── TaskPage.tsx    # Task management
├── services/           # API integration
│   └── api.ts          # API client and types
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## Setup Instructions

### Prerequisites
- Node.js 16+ ([Download](https://nodejs.org/))
- PNPM package manager (`npm install -g pnpm`)
- Backend API running on `http://localhost:8000`

### Installation

1. **Navigate to client directory:**
   ```bash
   cd emp-task-mangr-client
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```

4. **Open browser:**
   - Navigate to `http://localhost:5173`
   - Login with default credentials: `admin` / `admin123`

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## API Integration

The client communicates with the FastAPI backend through:

- **Base URL**: `http://localhost:8000`
- **Authentication**: JWT tokens in Authorization headers
- **Auto-retry**: Automatic token refresh on 401 errors
- **Error Handling**: User-friendly error messages

## Features Overview

### Authentication
- Secure JWT-based login
- Persistent session storage
- Automatic logout on token expiration
- Protected route system

### Employee Management
- **List View**: Cards showing employee details
- **Create**: Add new employees with validation
- **Edit**: Update existing employee information
- **Delete**: Remove employees (with task validation)
- **Search & Filter**: Easy employee discovery

### Task Management
- **Status Tracking**: Visual status indicators (pending/ongoing/completed)
- **Assignment**: Link tasks to specific employees
- **Due Dates**: Date/time picker for deadlines
- **Status Updates**: One-click status changes
- **Overdue Alerts**: Visual indicators for overdue tasks

### UI/UX Features
- **Responsive Design**: Works on mobile and desktop
- **Material Design**: Professional Google Material UI
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Confirmation Dialogs**: Prevent accidental deletions
- **Form Validation**: Real-time input validation

## Development

### Adding New Features

1. **Create new pages** in `src/pages/`
2. **Add routes** in `App.tsx`
3. **Extend API types** in `src/services/api.ts`
4. **Update navigation** in `src/components/Layout.tsx`

### Customization

- **Theme**: Modify `theme` in `App.tsx`
- **API Base URL**: Update `API_BASE_URL` in `src/services/api.ts`
- **Styling**: Use MUI's `sx` prop or create custom CSS

### Build for Production

```bash
# Build optimized bundle
pnpm build

# Preview production build
pnpm preview
```

## Troubleshooting

### Common Issues

1. **API Connection Error**
   - Ensure backend is running on `http://localhost:8000`
   - Check CORS settings in FastAPI backend

2. **Authentication Issues**
   - Clear browser localStorage
   - Verify backend credentials

3. **Build Errors**
   - Run `pnpm install` to update dependencies
   - Check TypeScript errors with `pnpm build`

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Follow TypeScript best practices
2. Use Material-UI components consistently
3. Add proper error handling
4. Include loading states for async operations
5. Write descriptive commit messages

---

**Happy Coding! 🚀**
