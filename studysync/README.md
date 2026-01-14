# StudySync - Collaborative Study Platform

StudySync is a modern web application built with Vite and TypeScript that helps students organize study groups, track progress, schedule tests, and share resources collaboratively.

## Features

### 🔐 Authentication
- User registration and login
- Session-based authentication
- Secure password handling

### 👥 Group Management
- Create study groups with custom syllabi
- Join groups using invite codes
- Real-time member collaboration

### 📚 Smart Progress Tracking
- Interactive syllabus with neon checkbox effects
- Priority-based learning system
- Real-time progress synchronization
- Smart concept prioritization based on upcoming tests

### ⏰ Countdown Widget
- Automatic countdown for upcoming tests (within 7 days)
- Priority topic highlighting
- Real-time updates every second

### 📝 Test Management
- Schedule quizzes, midterms, and finals
- Track covered topics and portions
- Automatic priority calculation for test preparation

### 📖 Resource Sharing
- Share websites, documents, and YouTube videos
- Collaborative resource approval system
- Organized by study group

### 🌟 Modern UI/UX
- Dark theme with neon accents
- Responsive design for all devices
- Smooth animations and transitions
- Custom neon checkbox components

## Tech Stack

- **Frontend**: Vite + TypeScript
- **Styling**: CSS with CSS Variables
- **State Management**: SessionStorage + Local State
- **HTTP Client**: Fetch API
- **WebSocket**: Socket.IO Client
- **Backend**: Node.js + Express (separate repository)
- **Database**: MongoDB Atlas

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend server running (see backend repository)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd studysync
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Backend Setup
Make sure the StudySync backend server is running on `http://localhost:3000`. The backend handles:
- User authentication
- Group management
- Progress tracking
- Real-time WebSocket connections

## Project Structure

```
src/
├── components/          # UI Components
│   ├── auth.ts         # Login/Register forms
│   ├── dashboard.ts    # User dashboard
│   ├── header.ts       # Navigation header
│   ├── create-group.ts # Group creation form
│   ├── join-group.ts   # Group joining form
│   └── group.ts        # Main group interface
├── api.ts              # API client
├── auth.ts             # Authentication utilities
├── countdown.ts        # Countdown widget logic
├── priority.ts         # Smart priority algorithm
├── router.ts           # Client-side routing
├── types.ts            # TypeScript interfaces
├── websocket.ts        # WebSocket client
├── style.css           # Global styles
└── main.ts             # Application entry point
```

## Key Features Explained

### Smart Priority System
The priority algorithm analyzes:
- Upcoming tests (within 7 days)
- User's completion history
- Concept order in syllabus

Priority levels:
- **Critical** (Red): Urgent test topics or first half of unfinished concepts
- **High** (Orange): Second half of unfinished concepts
- **Revision Old** (Blue): Early completed concepts or urgent completed topics
- **Revision Recent** (Green): Recently completed concepts

### Real-time Collaboration
- WebSocket connections for live updates
- Progress synchronization across all group members
- Real-time notifications for member activities

### Responsive Design
- Mobile-first approach
- Flexible layouts for all screen sizes
- Touch-friendly interface elements

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style
- TypeScript for type safety
- Modular component architecture
- CSS custom properties for theming
- Event-driven architecture for real-time features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.