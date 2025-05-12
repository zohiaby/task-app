#  Shop Management System

A comprehensive solution for managing vendors, shops, and locations built with modern technologies.

## Technologies Used

- **Frontend**: Next.js 14, React, Material UI, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Caching**: Redis
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT-based auth system
- **API**: RESTful architecture with proper error handling
- **Performance**: Redis caching for optimized data retrieval
- **Validation**: Server-side validation with custom validators
- **Rate Limiting**: Protection against abuse with rate limits
- **CI/CD**: Configured for continuous integration and deployment

## Project Overview

Salesflo is a vendor shop management system that allows businesses to efficiently track and manage their shops and locations. The application provides user-friendly interfaces for:

- Shop/Store management
- Location tracking and management
- User authentication and authorization
- Reporting and analytics
- Responsive design for all devices

## Folder Structure

```
salesflo/
├── docker-compose.yml          # Main Docker Compose configuration
├── README.md                   # This file
├── backend/                    # Backend Node.js application
│   ├── app.js                  # Express application setup
│   ├── server.js               # Server entry point
│   ├── Dockerfile              # Backend Docker configuration
│   ├── config/                 # Configuration files
│   │   ├── database.js         # Database configuration
│   │   ├── redis.js            # Redis configuration
│   │   └── init/               # Initialization scripts
│   ├── controllers/            # Request handlers
│   ├── middlewares/            # Express middlewares
│   ├── models/                 # Database models
│   └── routes/                 # API route definitions
└── frontend/                   # Next.js frontend application
    ├── Dockerfile              # Frontend Docker configuration
    ├── public/                 # Static assets
    └── src/                    # Source code
        ├── @core/              # Core components and utilities
        ├── @layouts/           # Layout components
        ├── @menu/              # Menu configurations and components
        ├── app/                # Next.js app directory
        │   ├── (dashboard)/    # Dashboard pages
        │   └── ...             # Other page groups
        ├── components/         # Reusable React components
        ├── configs/            # Frontend configurations
        ├── hooks/              # Custom React hooks
        └── utils/              # Utility functions
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine
- Git for version control

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd salesflo
   ```

2. Start the application using Docker Compose:

   ```bash
   docker-compose up -d
   ```

   This will:

   - Start MySQL database container
   - Start Redis container
   - Build and start the backend service
   - Build and start the frontend service

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Development Setup

#### Frontend Development

```bash
cd frontend
pnpm install
pnpm dev
```

#### Backend Development

```bash
cd backend
npm install
npm run dev
```

## Architecture

### Backend

The backend is built with Node.js and Express, following a modular architecture:

- **Controllers**: Handle incoming requests and return appropriate responses
- **Models**: Define database schemas and handle database interactions
- **Routes**: Define API endpoints and connect them to controllers
- **Middlewares**: Handle cross-cutting concerns like authentication, error handling, and rate limiting
- **Config**: Manage application configuration for different environments

### Frontend

The frontend is built with Next.js and follows a component-based architecture:

- **App Router**: Utilizes Next.js 14's app directory structure for routing
- **Layouts**: Reusable layouts for different sections of the application
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for data fetching and state management
- **Context Providers**: For global state management

### Database

- MySQL is used as the primary database
- Initialization scripts are included to set up the database schema
- Database configuration can be customized in the backend/config/database.js file

### Caching

- Redis is used for caching frequently accessed data
- Rate limiting is implemented using Redis
- Session management is handled through Redis

## Docker Configuration

The application is fully containerized using Docker:

1. **MySQL Container**: Persists application data in a volume
2. **Redis Container**: Provides caching and session storage
3. **Backend Container**: Runs the Node.js Express application
4. **Frontend Container**: Serves the Next.js application

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
NODE_ENV=development
PORT=5000
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=password
DB_NAME=vendor_shop_management
DB_PORT=3306
REDIS_HOST=redis
REDIS_PORT=6379
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
