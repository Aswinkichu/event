# Event Management Agency Backend

An industry-standard backend built with Node.js, Express, PostgreSQL, and Prisma ORM.

## 🏗️ Architecture Stack
- **API Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT (Access & Refresh Tokens)

---

## 🚀 Quick Setup & Installation

### 1. Environment Configuration
Navigate to `apps/api` and review `.env`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/event_mgmt?schema=public"
JWT_ACCESS_SECRET=your_access_secret_123
JWT_REFRESH_SECRET=your_refresh_secret_456
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=development
```

### 2. Local Setup (Without Docker)
Make sure you have a local instance of PostgreSQL running matching the `DATABASE_URL`.

Install dependencies from the root monorepo directory:
```bash
npm install
```

Generate Prisma Client and Run Migrations to create database tables:
```bash
npm run --workspace=apps/api prisma generate
npm run --workspace=apps/api prisma migrate dev --name init
```

### 3. Setup with Docker
Alternatively, spin up the entire application (Node API + Postgres Database) automatically:
```bash
docker-compose up --build
```
*Note: The Docker configuration automatically runs `prisma migrate deploy` on startup.*

---

## 🌱 Database Seeding

To insert initial functional data into your database, run the seed script. This is highly recommended to test the "Custom Event Builder" features immediately.

**To run the seed script locally:**
```bash
node apps/api/src/utils/seed.js
```

### What does the seed script do?
The script automatically cleans the database and inserts the following:

1.  **Default Admin Account**:
    - **Email**: `admin@eventagency.com` | **Password**: `adminpassword123`
2.  **Sample Customer Accounts**:
    - **Email**: `john@example.com` | **Password**: `password123`
    - **Email**: `jane@example.com` | **Password**: `password123`
3.  **Event Categories**:
    - Wedding, Birthday, Corporate.
4.  **Default Custom Options** (tied to each category):
    - **Food**: Veg Package ($500), Non-Veg Package ($800), Premium Buffet ($1200)
    - **Decor**: Standard Floral ($10000), Modern Theme ($15000)
    - **Venue**: Banquet Hall ($20000), Garden Area ($25000)
    - **Add-ons**: Photography ($5000), DJ & Sound ($3000)
5.  **Sample Bookings**:
    - Generates 3 realistic bookings (Pending, Confirmed, Completed) linked to the sample customers and categories to easily test the Admin dashboard and Customer history out of the box.

---

## 📖 API Reference
For comprehensive details on all HTTP endpoints (Auth, Customer, and Admin), please refer to the dedicated **[API Documentation](./apps/api/README.md)**.
