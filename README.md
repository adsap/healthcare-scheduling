# Healthcare Scheduling System

## Overview

This is a microservice-based Healthcare Scheduling System built with NestJS, GraphQL, PostgreSQL, and Docker. The system enables to manage consultation schedules between doctors and patients.


## Architecture

```
┌─────────────────┐    GraphQL     ┌─────────────────┐Bull Queue (Redis)┌─────────────────┐
│   Auth Service  │◄──────────────►│ Schedule Service│ ──────────────►  │Notification Svc │
│   (Port 3001)   │                │   (Port 3002)   │                  |  (Port 3003)    |
└─────────┬───────┘                └─────────┬───────┘                  |_________________|
          │                                  │                                │
          │                                  │                                │ API Call
          ▼                                  ▼                                ▼
┌─────────────────┐                ┌─────────────────┐                  ┌─────────────┐
│   PostgreSQL    │                │   PostgreSQL    │                  │  Brevo API  │
│   (Auth DB)     │                │  (Schedule DB)  │                  │(Email Notif)│
└─────────────────┘                └─────────┬───────┘                  └─────────────┘
```

### Services

1. **Auth Service** (Port 3001) - Handles authentication and user management
2. **Schedule Service** (Port 3002) - Manages customers, doctors, and schedules
3. **Notification Service** (Port 3003) - Handles email notifications via Brevo API

---

## Prerequisites

1. **Docker** - If running using docker compose
2. **Node.js 20+** - If running locally
3. **Brevo Account** - Required for email notifications (Notification Service)
   - Sign up at [https://www.brevo.com](https://www.brevo.com)
   - Get API key from the dashboard

---

## How to Run the Project

### Option 1: Using Docker Compose

**Steps:**
1. Clone the repository
```bash
git clone <repository-url>
cd healthcare-scheduling
```

2. Set up environment variables (see Environment Variables section)

3. Start all services:
```bash
# First time setup
docker-compose up --build

# For subsequent starts
docker-compose up
```

4. Stop services:
```bash
docker-compose down
```

### Option 2: Run Locally

**Steps:**

1. Install dependencies in each service:
```bash
# Auth Service
cd auth-service
npm install

# Schedule Service
cd ../schedule-service
npm install

# Notification Service
cd ../notification-service
npm install
```

2. Set up databases:
- Create two PostgreSQL databases: `auth_db` and `schedule_db`
- Run the initialization script: `psql -U postgres -f init-db.sql`

3. Set up environment variables (see Environment Variables section)

4. Run each service in separate terminals:
```bash
# Terminal 1 - Auth Service
cd auth-service
npm run start:dev

# Terminal 2 - Schedule Service
cd schedule-service
npm run start:dev

# Terminal 3 - Notification Service
cd notification-service
npm run start:dev
```

---

## Environment Variables

### Root `.env` file
See `.env.example` for reference. This file contains shared variables used by Docker Compose:

```env
# Database
POSTGRES_USER=postgres_username
POSTGRES_PASSWORD=your_postgres_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=1d

# Service URLs
AUTH_SERVICE_URL=http://auth-service:3001
SCHEDULE_SERVICE_URL=http://schedule-service:3002
NOTIFICATION_SERVICE_URL=http://notification-service:3003

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Ports
AUTH_PORT=3001
SCHEDULE_PORT=3002
NOTIFICATION_PORT=3003

# Environment
NODE_ENV=development

# Email (for notifications)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_email@example.com
```

### Auth Service `.env`
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/auth_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=1d
PORT=3001
```

### Schedule Service `.env`
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/schedule_db
AUTH_SERVICE_URL=http://localhost:3001
REDIS_HOST=localhost
REDIS_PORT=6379
NOTIFICATION_SERVICE_URL=http://localhost:3003
PORT=3002
```

### Notification Service `.env`
```env
REDIS_HOST=localhost
REDIS_PORT=6379
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_email@example.com
PORT=3003
```

---

## GraphQL Queries & Mutations

### Authentication (Auth Service)
**Base URL:** `http://localhost:3001/graphql`

#### Login
```graphql
mutation {
  login(loginDto: {
    email: "user@mail.com"
    password: "password123"
  }) {
    accessToken
  }
}
```

#### Register
```graphql
mutation {
  register(registerDto: {
    email: "user@mail.com"
    password: "password123"
  }) {
    id
    email
  }
}
```

### Schedule Service
**Base URL:** `http://localhost:3002/graphql`

**Important:** Add the following header to all requests:
```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

#### Customer Operations

##### Create Customer
```graphql
mutation CreateCustomer {
  createCustomer(createCustomerDto: {
    name: "Andi"
    email: "andi@mail.com"
  }) {
    id
    name
    email
    createdAt
    updatedAt
  }
}
```

##### Get All Customers (with pagination)
```graphql
query GetAllCustomers {
  customers(page: 1, limit: 10) {
    data {
      id
      name
      email
      createdAt
      updatedAt
    }
    pagination {
      page
      limit
      total
      totalPages
    }
  }
}
```

##### Get Customer by ID
```graphql
query GetCustomerById {
  customer(id: "customer-uuid-here") {
    id
    name
    email
    createdAt
    updatedAt
  }
}
```

##### Update Customer
```graphql
mutation UpdateCustomer {
  updateCustomer(
    id: "customer-uuid-here"
    updateCustomerDto: {
      name: "John"
      email: "john@mail.com"
    }
  ) {
    id
    name
    email
    createdAt
    updatedAt
  }
}
```

##### Delete Customer
```graphql
mutation DeleteCustomer {
  deleteCustomer(id: "customer-uuid-here") {
    id
    name
    email
    createdAt
    updatedAt
  }
}
```

#### Doctor Operations

##### Create Doctor
```graphql
mutation CreateDoctor {
  createDoctor(createDoctorDto: {
    name: "Beni"
  }) {
    id
    name
    createdAt
    updatedAt
  }
}
```

##### Get All Doctors (with pagination)
```graphql
query GetAllDoctors {
  doctors(page: 1, limit: 10) {
    data {
      id
      name
      createdAt
      updatedAt
    }
    pagination {
      page
      limit
      total
      totalPages
    }
  }
}
```

##### Get Doctor by ID
```graphql
query GetDoctorById {
  doctor(id: "doctor-uuid-here") {
    id
    name
    createdAt
    updatedAt
    schedules {
      id
      objective
      scheduledAt
      customer {
        name
        email
      }
    }
  }
}
```

#### Schedule Operations

##### Create Schedule
```graphql
mutation CreateSchedule {
  createSchedule(createScheduleDto: {
    objective: "General consultation"
    customerId: "customer-uuid-here"
    doctorId: "doctor-uuid-here"
    scheduledAt: "2025-12-15T10:00:00Z"
  }) {
    id
    objective
    scheduledAt
    createdAt
    updatedAt
    customer {
      id
      name
      email
    }
    doctor {
      id
      name
    }
  }
}
```

##### Get All Schedules (with pagination and filters)
```graphql
query GetAllSchedules {
  schedules(
    page: 1
    limit: 10
    customerId: "customer-uuid-here"
    doctorId: "doctor-uuid-here"
    dateFrom: "2025-12-01T00:00:00Z"
    dateTo: "2025-12-31T23:59:59Z"
  ) {
    data {
      id
      objective
      scheduledAt
      createdAt
      updatedAt
      customer {
        id
        name
        email
      }
      doctor {
        id
        name
      }
    }
    pagination {
      page
      limit
      total
      totalPages
    }
  }
}
```

##### Get Schedule by ID
```graphql
query GetScheduleById {
  schedule(id: "schedule-uuid-here") {
    id
    objective
    scheduledAt
    createdAt
    updatedAt
    customer {
      id
      name
      email
    }
    doctor {
      id
      name
    }
  }
}
```

##### Delete Schedule
```graphql
mutation DeleteSchedule {
  deleteSchedule(id: "schedule-uuid-here") {
    id
    objective
    scheduledAt
    createdAt
    updatedAt
    customer {
      id
      name
      email
    }
    doctor {
      id
      name
    }
  }
}
```


---

## Testing

The system includes unit tests with Jest:

```bash
# Run tests in a service
cd auth-service
npm run test

# Run tests with coverage
npm run test:cov
```

---
