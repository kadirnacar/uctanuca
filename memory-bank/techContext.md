# Technology Context

## Technologies Used
- **Frontend**: React (v18+), Vite, JavaScript/TypeScript
- **Backend**: Go (v1.21+), Go Modules
- **Encryption**: AES-256 with secure key management
- **API Communication**: RESTful APIs with JSON
- **Authentication**: JWT tokens with secure signing
- **Build Tools**: Vite for frontend, Go build for backend
- **Testing**: Jest for frontend, Go testing for backend

## Development Setup
1. Install Node.js v18+ and Go v1.21+
2. Install dependencies:
   - Frontend: `cd frontend && npm install`
   - Backend: `cd backend && go mod download`
3. Start development servers:
   - Frontend: `cd frontend && npm run dev`
   - Backend: `cd backend && go run main.go`
4. API endpoints:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:8080`

## Technical Constraints
- Must maintain backward compatibility with existing API endpoints
- All sensitive data must be encrypted using AES-256
- Session tokens must expire within 24 hours
- Frontend must render on all modern browsers
- Backend must handle 10,000+ requests per minute
- All error messages must be generic to prevent information leakage

## Tool Usage Patterns
- Use Vite for frontend development with hot module replacement
- Use Go's built-in testing framework for backend unit tests
- Use React hooks for state management
- Use Go middleware for cross-cutting concerns like authentication and encryption
- Use environment variables for configuration (not hardcoded values)
- Use git for version control with proper commit messages
- Use .env files for local development configurations
- Use secure key management practices for encryption keys
