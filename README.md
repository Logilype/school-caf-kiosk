# Cafeteria Display System

A digital signage system for displaying cafeteria menus and school information.

## Project Structure
```
project-root/
├── client/                 # Electron client application
├── server/                 # Express backend server
└── deployment/            # Deployment configurations
```

## Development Setup

1. Install dependencies:
```bash
npm run install:all
```

2. Start development servers:
```bash
# Terminal 1 - Start server
npm run server:dev

# Terminal 2 - Start client
npm run client:dev
```

## Deployment

See deployment/README.md for production deployment instructions.