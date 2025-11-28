# System Patterns

## Architecture Overview
uctanuca follows a clean separation of concerns with a modern frontend (React) and backend (Go) architecture. The system is designed to ensure security at every layer.

## Key Components
1. **Frontend**: React application with component-based architecture
2. **Backend**: Go server with modular middleware architecture
3. **Encryption Layer**: End-to-end encryption for sensitive data
4. **Session Management**: Secure token-based authentication
5. **API Gateway**: Secure communication between frontend and backend

## Design Patterns in Use
- **Microservices Pattern**: Separation of concerns between frontend and backend
- **Middleware Pattern**: Go middleware for encryption and authentication
- **Observer Pattern**: React state management with hooks
- **Singleton Pattern**: Secure session management with global state
- **Factory Pattern**: Dynamic creation of encrypted data objects

## Critical Implementation Paths
1. User authentication flow from frontend to backend
2. Secure API communication with encryption/decryption
3. Session management lifecycle (creation, validation, expiration)
4. Error handling and recovery for security-critical operations
5. Data flow from user input to encrypted storage

## Security Patterns
- End-to-end encryption for all sensitive data
- Secure token generation and validation
- Input validation and sanitization at all boundaries
- Rate limiting and protection against brute force attacks
- Proper error handling that doesn't leak sensitive information
