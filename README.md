# EchoSphere

A robust, real-time communication platform designed for seamless interaction across all devices.

## Overview

EchoSphere is a modern chat application engineered to provide instant messaging capabilities with a focus on security, performance, and user experience. It bridges the gap between simple messaging and professional communication tools, offering a responsive interface that adapts flawlessly to any screen size.

Built with a production-first mindset, the architecture emphasizes type safety, secure authentication flows, and scalable real-time infrastructure.

## Key Features

### Authentication & Security
- **Hybrid Authentication**: Secure login via email/password or OAuth providers (Google & GitHub).
- **Session Management**: Stateless JWT implementation with Access and Refresh token rotation.
- **Security Standards**: Implemented rate limiting, strict CORS policies, and environment variable validation using Zod.

### Real-Time Communication
- **Instant Messaging**: Powered by Socket.IO for low-latency message delivery.
- **Live Updates**: Real-time user status and typing indicators.

### User Experience
- **Responsive Design**: Mobile-first architecture ensuring native-like experience on phones and tablets.
- **Modern UI**: Clean, accessible interface built with Tailwind CSS and Shadcn UI.
- **Optimized Performance**: Lazy loading and efficient asset management via Vite.

## Tech Stack

**Frontend**
- React (TypeScript)
- Vite
- Tailwind CSS
- Socket.IO Client
- React Router DOM

**Backend**
- Node.js & Express
- MongoDB (Mongoose)
- Socket.IO
- Passport.js (OAuth Strategies)
- Zod (Validation)

**Deployment**
- **Frontend**: Vercel (Edge Network)
- **Backend**: Render (Web Service)

## Authentication Flow

The application uses a secure OAuth 2.0 flow integrated with JWT:

1.  **Initiation**: User selects "Continue with Google/GitHub".
2.  **Delegation**: Redirects to the provider for consent.
3.  **Callback**: Provider redirects back to the backend API.
4.  **Token Generation**: Backend validates identity and generates Access & Refresh tokens.
5.  **Handoff**: Backend redirects to the frontend client with tokens securely passed.
6.  **Session**: Frontend initializes the session and connects to the WebSocket server.

## Project Structure

```text
echosphere/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment & Passport config
│   │   ├── controllers/    # Request handlers
│   │   ├── loaders/        # Startup logic (Express, DB, Socket)
│   │   ├── middlewares/    # Auth, Upload, Error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   └── socket/         # WebSocket handlers
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # Auth & Theme contexts
    │   ├── features/       # Feature-based modules (Auth, Chat)
    │   ├── lib/            # Utilities (Axios, Socket)
    │   └── styles/         # Global styles
    └── vercel.json         # Deployment configuration
```

## Local Setup

**Prerequisites**
- Node.js (v18+)
- MongoDB Instance

**1. Clone the repository**
```bash
git clone https://github.com/Asit-14/echosphere-app.git
cd echosphere-app
```

**2. Backend Setup**
```bash
cd backend
npm install
# Create .env file with PORT, MONGODB_URI, JWT_SECRETS, and OAUTH_CREDENTIALS
npm run dev
```

**3. Frontend Setup**
```bash
cd frontend
npm install
# Create .env file with VITE_API_BASE_URL
npm run dev
```

## Production Deployment

This project is configured for cloud deployment:

- **Backend (Render)**:
  - Requires `trust proxy` enabled for correct rate limiting.
  - Environment variables must match the production configuration.
  
- **Frontend (Vercel)**:
  - Uses `vercel.json` for SPA routing rewrites.
  - Connects to the backend via secure HTTPS endpoints.

---

<div align="right">
  <p>Thoughtfully crafted by <strong>Asit Kumar</strong></p>
</div>
