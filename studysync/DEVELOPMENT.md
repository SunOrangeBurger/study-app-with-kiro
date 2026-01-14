# StudySync Development Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:5173`

## Backend Requirements

The frontend expects a backend server running on `http://localhost:3000`. See `BACKEND_API.md` for complete API specification.

### Quick Backend Setup (if you have the backend code):
```bash
# In backend directory
npm install
npm start
```

## Project Architecture

### Frontend Structure
```
src/
├── components/          # UI Components
│   ├── auth.ts         # Authentication forms
│   ├── dashboard.ts    # User dashboard
│   ├── header.ts       # Navigation header
│   ├── create-group.ts # Group creation
│   ├── join-group.ts   # Group joining
│   └── group.ts        # Main group interface
├── api.ts              # HTTP API client
├── auth.ts             # Authentication utilities
├── countdown.ts        # Test countdown logic
├── priority.ts         # Smart priority algorithm
├── router.ts           # Client-side routing
├── types.ts            # TypeScript interfaces
├── websocket.ts        # WebSocket client
├── style.css           # Global styles
└── main.ts             # Application entry point
```

### Key Features

#### 1. Smart Priority System
Located in `src/priority.ts`, this algorithm:
- Identifies urgent topics (tests within 7 days)
- Prioritizes unfinished concepts
- Suggests revision for completed topics
- Uses 4 priority levels with color coding

#### 2. Real-time Collaboration
- WebSocket integration via Socket.IO
- Live progress updates across group members
- Real-time notifications

#### 3. Countdown Widget
- Automatic detection of upcoming tests
- Real-time countdown display
- Priority topic highlighting

#### 4. Responsive UI
- Dark theme with neon accents
- Custom checkbox components
- Mobile-friendly design

## Development Workflow

### Adding New Features

1. **Create component file** in `src/components/`
2. **Add route** in `src/main.ts`
3. **Update navigation** in `src/components/header.ts`
4. **Add API endpoints** in `src/api.ts` if needed
5. **Update types** in `src/types.ts` if needed

### Styling Guidelines

- Use CSS custom properties (variables) defined in `:root`
- Follow the neon theme color palette
- Maintain responsive design principles
- Use the `.neon-checkbox` class for interactive elements

### State Management

- Authentication: `AuthManager` class with sessionStorage
- Group data: Local component state with API synchronization
- Real-time updates: WebSocket event handlers

## Testing

### Manual Testing Checklist

1. **Authentication Flow:**
   - [ ] User registration
   - [ ] User login/logout
   - [ ] Session persistence

2. **Group Management:**
   - [ ] Create group with syllabus
   - [ ] Join group with invite code
   - [ ] View group dashboard

3. **Progress Tracking:**
   - [ ] Mark concepts as complete
   - [ ] Priority system updates
   - [ ] Real-time synchronization

4. **Countdown Widget:**
   - [ ] Displays for upcoming tests
   - [ ] Updates every second
   - [ ] Shows priority topics

5. **Responsive Design:**
   - [ ] Mobile layout
   - [ ] Tablet layout
   - [ ] Desktop layout

## Common Issues

### Backend Connection
If you see API errors, ensure:
- Backend server is running on port 3000
- CORS is properly configured
- Database connection is established

### WebSocket Issues
If real-time features don't work:
- Check browser console for connection errors
- Verify Socket.IO server is running
- Ensure proper event handling

### Build Issues
If build fails:
- Check TypeScript errors with `npm run build`
- Verify all imports use correct paths
- Ensure all dependencies are installed

## Performance Considerations

- Components use event delegation for dynamic content
- WebSocket connections are managed per group
- API calls are optimized with proper error handling
- CSS animations use hardware acceleration

## Browser Support

- Modern browsers with ES2020+ support
- WebSocket support required
- Local storage support required

## Deployment

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test on multiple screen sizes
4. Ensure WebSocket cleanup in components
5. Update documentation for new features