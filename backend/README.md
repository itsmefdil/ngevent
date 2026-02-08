# NGEvent Backend API

Backend API untuk platform manajemen event NGEvent, dibangun dengan Express.js dan PostgreSQL.

## Fitur

- ✅ Autentikasi & Autorisasi (JWT)
- ✅ Manajemen Event (CRUD)
- ✅ Registrasi Event
- ✅ Manajemen Profil User
- ✅ Upload Gambar (Cloudinary)
- ✅ Email Notifications (Resend)
- ✅ Broadcasting ke Participants
- ✅ In-app Notifications
- ✅ Winston Logger
- ✅ Swagger API Documentation
- ✅ Rate Limiting
- ✅ Security Headers (Helmet)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT + bcrypt
- **File Storage**: Cloudinary
- **Email**: Resend
- **Logger**: Winston
- **Documentation**: Swagger/OpenAPI 3.0

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` dan sesuaikan dengan konfigurasi Anda:

```bash
cp .env.example .env
```

Edit file `.env`:

```env
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ngevent
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Setup Database

Pastikan PostgreSQL sudah terinstall dan running, kemudian buat database:

```bash
createdb ngevent
```

Jalankan migrasi:

```bash
npm run migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001`

### 5. API Documentation

Akses Swagger UI di browser:

```
http://localhost:3001/api-docs
```

**Authentication:**
- Username: `admin` (default, dapat diubah via `SWAGGER_USERNAME`)
- Password: `admin123` (default, dapat diubah via `SWAGGER_PASSWORD`)

Swagger menyediakan:
- ✅ Interactive API testing
- ✅ Complete endpoint documentation
- ✅ Request/response schemas
- ✅ Authentication testing dengan JWT token
- ✅ Protected dengan Basic Auth

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verifikasi email
- `POST /api/auth/forgot-password` - Request reset password
- `POST /api/auth/reset-password` - Reset password

### Events
- `GET /api/events` - Get all events (public)
- `GET /api/events/:id` - Get event detail
- `POST /api/events` - Create event (organizer/admin)
- `PUT /api/events/:id` - Update event (organizer/admin)
- `DELETE /api/events/:id` - Delete event (organizer/admin)
- `POST /api/events/:id/publish` - Publish event
- `POST /api/events/:id/speakers` - Add speaker
- `PUT /api/events/:id/speakers/:speakerId` - Update speaker
- `DELETE /api/events/:id/speakers/:speakerId` - Delete speaker

### Profile
- `GET /api/profile/me` - Get current user profile
- `PUT /api/profile/me` - Update profile
- `GET /api/profile/:id` - Get profile by ID

### Registrations
- `POST /api/registrations` - Register for event
- `GET /api/registrations/my-events` - Get my registrations
- `DELETE /api/registrations/:id` - Cancel registration
- `GET /api/registrations/event/:eventId` - Get event registrations (organizer)
- `PUT /api/registrations/:id/status` - Update registration status

### Upload
- `POST /api/upload/image` - Upload image
- `DELETE /api/upload/image` - Delete image

### Health
- `GET /api/health` - Health check
- `GET /api/health/db` - Database health check

### Broadcast
- `POST /api/broadcast/:eventId` - Send email broadcast to participants (organizer/admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Logging

Backend menggunakan **Winston** untuk logging dengan fitur:

### Log Levels
- `error` - Error yang memerlukan perhatian
- `warn` - Warning dan AppError
- `info` - Informasi penting (startup, registrasi user, dll)
- `http` - HTTP request logs
- `debug` - Debugging information

### Log Output
- **Console**: Semua log dengan colorized output
- **File logs/error.log**: Error logs only (JSON format)
- **File logs/combined.log**: All logs (JSON format)

### Environment Configuration
- **Development**: Log level = `debug` (semua log)
- **Production**: Log level = `info` (info ke atas)

### Log Format
```
2025-01-26 10:30:45:123 info: 🚀 Server is running on port 3001
2025-01-26 10:30:46:456 http: GET /api/events 200 - 45ms
2025-01-26 10:31:00:789 error: Unexpected error: Database connection failed
```

Log files akan otomatis dibuat di folder `logs/` dan tidak di-commit ke git.

## Testing

Backend dilengkapi dengan comprehensive test suite menggunakan **Vitest** dan **Supertest**.

### Run Tests

```bash
# Run all tests
bun test

# Watch mode (auto-rerun)
bun test:watch

# With coverage
bun test:coverage
```

### Test Coverage

- **52+ tests** covering core features:
  - ✅ Authentication (14 tests) - Register, login, password reset
  - ✅ Events (20 tests) - CRUD, speakers, publishing
  - ✅ Registrations (18 tests) - Register, cancel, status updates

### Test Database Setup

```bash
# Create test database
createdb ngevent_test

# Configure in .env.test
TEST_DATABASE_URL=postgresql://localhost/ngevent_test

# Run migrations
DATABASE_URL=postgresql://localhost/ngevent_test bun run db:migrate
```

Lihat [TESTING.md](TESTING.md) untuk dokumentasi lengkap.

## Database Schema

Database menggunakan PostgreSQL dengan struktur:

- `users` - User accounts dan autentikasi
- `profiles` - User profiles
- `events` - Event data
- `speakers` - Event speakers
- `registrations` - Event registrations
- `form_fields` - Custom form fields untuk event
- `notifications` - User notifications

## Scripts

- `npm run dev` - Run development server dengan hot reload
- `npm run build` - Build untuk production
- `npm start` - Run production server
- `npm run db:generate` - Generate migration dari schema changes
- `npm run db:migrate` - Apply pending migrations to database
- `npm run db:push` - Push schema changes directly (skip migrations)
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed` - Seed database dengan sample data
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

### Database Migration

For detailed migration guide, see [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)

**Quick Start:**
```bash
# Generate migration from schema
bun run db:generate

# Apply migrations
bun run db:migrate

# Or use the helper script
./run-migration.sh
```

**Recent Changes:**
- Event IDs changed from UUID to 6-character format (v6)
- URLs changed from `/events/:uuid` to `/e/:6char`
- See [update.md](update.md) for details

## Security

- Password di-hash menggunakan bcrypt
- JWT untuk autentikasi
- Rate limiting untuk mencegah abuse
- Helmet untuk security headers
- CORS protection
- Input validation

## Deployment

Untuk production:

1. Build aplikasi:
```bash
npm run build
```

2. Set environment variables di production

3. Jalankan server:
```bash
npm start
```
