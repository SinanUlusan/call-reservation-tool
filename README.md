# Call Reservation Tool

A comprehensive NestJS backend service for managing call reservations with admin controls and user notifications, similar to Calendly.com.

## 🌐 Live Demo

**🎯 Test the Application**: [https://calenmate.netlify.app/](https://calenmate.netlify.app/)

The application is deployed with:

- **Backend**: Railway (NestJS API)
- **Frontend**: Netlify (React + Vite UI)
- **API Documentation**: [https://call-reservation-tool-production.up.railway.app/api/docs#/](https://call-reservation-tool-production.up.railway.app/api/docs#/)

## 🚀 Features

- **Reservation Management**: Create, update, cancel, and track call reservations
- **Time Slot Management**: 15-minute interval time slots with conflict prevention
- **Admin Controls**: Accept/reject reservations with notification system
- **Multi-channel Notifications**: Email, SMS, and push notifications
- **Real-time Updates**: RabbitMQ integration for push notifications
- **Comprehensive API**: RESTful API with Swagger documentation
- **Database Integration**: TypeORM with SQLite (easily configurable for PostgreSQL/MySQL)
- **Testing**: Unit and integration tests with Jest
- **CI/CD**: GitHub Actions pipeline with automated testing and deployment
- **Live Deployment**: Backend on Railway, Frontend on Netlify

## 📋 Requirements

- Node.js 20+
- npm or yarn
- SQLite (included) or PostgreSQL/MySQL
- RabbitMQ (for push notifications)

## 🚀 Quick Start

### Option 1: Test Live Application (Recommended)

Visit the live application at [https://calenmate.netlify.app/](https://calenmate.netlify.app/) to test all features without local setup.

### Option 2: Docker (Local Development)

```bash
# Clone and start with Docker
git clone https://github.com/SinanUlusan/call-reservation-tool.git
cd call-reservation-tool
npm run docker:prod

# Check if running
curl http://localhost:3000/api
```

### Option 3: Local Development

```bash
# Clone repository
git clone https://github.com/SinanUlusan/call-reservation-tool.git
cd call-reservation-tool

# Install dependencies
npm install

# Setup database
npm run migration:run

# Start development server
npm run start:dev
```

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/SinanUlusan/call-reservation-tool.git
   cd call-reservation-tool
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp apps/call-reservation-tool/config.env .env
   # Edit .env with your configuration
   ```

4. **Database Setup (Migration)**

   ```bash
   # Run migrations
   npm run migration:run

   # Check migration status
   npm run migration:show
   ```

5. **Run the application**

   ```bash
   # Development
   npm run start:dev

   # Production (Local)
   npm run build:prod
   npm run start:prod
   ```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services (Production)
npm run docker:prod

# Start development environment
npm run docker:dev

# View logs
npm run docker:logs

# Stop services
npm run docker:down

# Inspect database
npm run docker:inspect-db
```

### Using Docker directly

```bash
# Build image
npm run docker:build

# Run container
docker run -p 3000:3000 call-reservation-tool
```

## 📋 Available Scripts

### Development

```bash
npm run start:dev          # Start development server
npm run build              # Build application
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests
npm run lint               # Lint code
```

### Production

```bash
npm run build:prod         # Build for production
npm run start:prod         # Start production server
```

### Database Migration

```bash
npm run migration:generate # Generate new migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration
npm run migration:show     # Show migration status
```

### Docker

```bash
npm run docker:build       # Build Docker image
npm run docker:dev         # Start development with Docker
npm run docker:prod        # Start production with Docker
npm run docker:down        # Stop Docker containers
npm run docker:logs        # View Docker logs
npm run docker:inspect-db  # Inspect database in Docker
```

## 📚 API Documentation

### Live API (Railway Deployment)

- **API Base URL**: `https://call-reservation-tool-production.up.railway.app/api`
- **Swagger Documentation**: `https://call-reservation-tool-production.up.railway.app/api/docs#/`

### Local Development

Once the application is running locally, visit:

- **API Base URL**: `http://localhost:3000/api`
- **Swagger Documentation**: `http://localhost:3000/api/docs`

### Key Endpoints

#### Reservation Management

- `POST /api/reservation` - Create a new reservation
- `GET /api/reservation` - Get all reservations
- `GET /api/reservation/:id` - Get a specific reservation
- `PUT /api/reservation/:id/cancel` - Cancel a reservation
- `PUT /api/reservation/:id/time` - Update reservation time
- `PUT /api/reservation/:id/admin-action` - Admin accept/reject action

#### Admin Operations

- `GET /api/admin/reservations` - Get all reservations (admin view)
- `GET /api/admin/reservations/pending` - Get pending reservations
- `PUT /api/admin/send-reminders` - Send reminder notifications

## 🏗️ Architecture

### Project Structure

```
src/
├── modules/
│   ├── reservation/          # Reservation management
│   │   ├── reservation.controller.ts
│   │   ├── reservation.service.ts
│   │   ├── reservation.module.ts
│   │   └── *.spec.ts         # Tests
│   └── admin/                # Admin operations
│       ├── admin.controller.ts
│       └── admin.module.ts
├── shared/
│   ├── entities/             # Database entities
│   │   └── reservation.entity.ts
│   ├── enums/               # Application enums
│   │   └── reservation-status.enum.ts
│   ├── interfaces/          # TypeScript interfaces
│   │   └── reservation.interface.ts
│   ├── dto/                 # Data Transfer Objects
│   │   ├── create-reservation.dto.ts
│   │   └── admin-action.dto.ts
│   └── services/            # Shared services
│       ├── email.service.ts
│       ├── sms.service.ts
│       └── push-notification.service.ts
└── app/
    ├── app.module.ts        # Main application module
    ├── app.controller.ts    # Health check controller
    └── main.ts             # Application entry point
```

### Database Schema

#### Reservation Entity

- `id`: UUID primary key
- `startTime`: Call start time (HH:mm format)
- `endTime`: Call end time (calculated)
- `email`: User email address
- `phone`: User phone number
- `pushNotificationKey`: Push notification identifier
- `receiveEmail`: Email notification preference
- `receiveSmsNotification`: SMS notification preference
- `receivePushNotification`: Push notification preference
- `status`: Reservation status (QUEUED, ACCEPTED, SUCCESSFUL, CANCELLED, REJECTED)
- `reservationDate`: Date of reservation
- `createdTime`: Record creation timestamp
- `updatedTime`: Record update timestamp

### Notification System

#### Email Notifications

- **Cancellation**: Admin notified when user cancels
- **Rejection**: User notified when admin rejects
- **Reminders**: 10 minutes before call (if enabled)

#### SMS Notifications

- **Reminders**: 5 minutes before call (if enabled)

#### Push Notifications

- **Reminders**: 1 minute before call (if enabled)
- **Real-time**: Via RabbitMQ message queue

## 🗄️ Database Migration

### Migration Commands

```bash
# Generate new migration (after entity changes)
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Migration Workflow

1. **Make entity changes** in `src/shared/entities/`
2. **Generate migration**:
   ```bash
   npm run migration:generate -- -n AddNewField
   ```
3. **Review migration file** in `src/migrations/`
4. **Run migration**:
   ```bash
   npm run migration:run
   ```

### Production Migration

- **Development**: `synchronize: true` (automatic schema updates)
- **Production**: `synchronize: false` + `migrationsRun: true` (safe schema management)
- **Docker**: Migrations run automatically on container start

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Lint code
npm run lint
```

### Test Structure

- **Unit Tests**: Service and controller logic
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Full application workflow

## 🔧 Configuration

### Environment Variables

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_PATH=reservations.db

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# CORS
FRONTEND_URL=http://localhost:3000

# Admin
ADMIN_EMAIL=admin@example.com
```

### Database Configuration

The application uses SQLite by default but can be easily configured for other databases:

```typescript
// PostgreSQL example
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'reservations',
  entities: [Reservation],
  synchronize: true,
});
```

## 🚀 Deployment

### Current Deployment

- **Backend**: Deployed on [Railway](https://railway.app/) at `https://call-reservation-tool-production.up.railway.app`
- **Frontend**: Deployed on [Netlify](https://netlify.com/) at `https://calenmate.netlify.app/`
- **Database**: PostgreSQL on Railway
- **CI/CD**: GitHub Actions with automated deployment

### Production Considerations

1. **Database**: PostgreSQL on Railway for production
2. **Environment Variables**: Set all required environment variables
3. **Security**: HTTPS enabled and proper CORS configuration
4. **Monitoring**: Railway provides built-in monitoring and logging
5. **Scaling**: Railway handles automatic scaling

### CI/CD Pipeline

The GitHub Actions pipeline includes:

- **Testing**: Unit, integration, and e2e tests
- **Security**: Dependency audit and security scanning
- **Building**: Application build and artifact creation
- **Deployment**: Automated deployment to Railway

## 📝 API Examples

### Create Reservation (Live API)

```bash
curl -X POST https://call-reservation-tool-production.up.railway.app/api/reservation \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "13:15",
    "email": "user@example.com",
    "phone": "+1234567890",
    "pushNotificationKey": "user-push-key-123",
    "receiveEmail": true,
    "receiveSmsNotification": true,
    "receivePushNotification": true
  }'
```

### Create Reservation (Local)

```bash
curl -X POST http://localhost:3000/api/reservation \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "13:15",
    "email": "user@example.com",
    "phone": "+1234567890",
    "pushNotificationKey": "user-push-key-123",
    "receiveEmail": true,
    "receiveSmsNotification": true,
    "receivePushNotification": true
  }'
```

### Cancel Reservation (Live API)

```bash
curl -X PUT https://call-reservation-tool-production.up.railway.app/api/reservation/{id}/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "adminEmail": "admin@example.com"
  }'
```

### Admin Action (Live API)

```bash
curl -X PUT https://call-reservation-tool-production.up.railway.app/api/reservation/{id}/admin-action \
  -H "Content-Type: application/json" \
  -d '{
    "action": "accept",
    "adminEmail": "admin@example.com"
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commits
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the test files for usage examples
