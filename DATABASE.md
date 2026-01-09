# Database Schema Documentation

## Overview

This document describes the database schema for the B2B Gig Platform built with Prisma and PostgreSQL.

## Quick Start

### 1. Install Dependencies

```bash
npm install prisma @prisma/client
npm install -D @types/bcrypt bcrypt
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/gigit_platform?schema=public"
```

### 3. Initialize Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# Seed the database with initial data
npx prisma db seed
```

### 4. View Database in Prisma Studio

```bash
npx prisma studio
```

This will open a browser interface at `http://localhost:5555` to view and edit your data.

---

## Database Schema

### Core Entities

#### 1. **Users** (`users`)
Base table for all user types (Workers, Businesses, Admins).

**Key Fields:**
- `id`: Unique identifier
- `email`: Login email (unique)
- `userType`: WORKER | BUSINESS | ADMIN
- `emailVerified`: Email verification status

**Relations:**
- One-to-one with `WorkerProfile` or `BusinessProfile`
- One-to-many with `Message`, `Notification`, `Review`

---

#### 2. **Worker Profile** (`worker_profiles`)
Extended profile information for workers.

**Key Fields:**
- `firstName`, `lastName`: Personal information
- `hourlyRate`: Proposed hourly rate
- `availabilityStatus`: AVAILABLE | BUSY | NOT_AVAILABLE
- `verificationStatus`: Account verification status
- `ratingAverage`: Average rating (0-5)
- `totalJobsCompleted`: Number of completed jobs

**Relations:**
- Belongs to `User`
- Has many `WorkerSkill`, `Certification`, `PortfolioItem`
- Has many `JobApplication`, `Contract`

---

#### 3. **Skills** (`skills`)
Master list of all available skills.

**Example Skills:**
- Plumbing
- Welding
- Painting
- Carpentry
- HVAC
- etc.

**Grouped by Categories:**
- Construction & Building
- Maintenance & Repair
- Landscaping & Outdoor
- Automotive
- Manufacturing
- etc.

---

#### 4. **Worker Skills** (`worker_skills`)
Junction table connecting workers to their skills.

**Key Fields:**
- `proficiencyLevel`: BEGINNER | INTERMEDIATE | EXPERT
- `yearsOfExperience`: Years of experience in this skill

---

#### 5. **Business Profile** (`business_profiles`)
Company information for businesses.

**Key Fields:**
- `companyName`: Business name
- `companyRegistrationNumber`: Business registration (unique)
- `companySize`: SMALL | MEDIUM | LARGE | ENTERPRISE
- `verificationStatus`: Account verification status

**Relations:**
- Belongs to `User`
- Has many `JobPost`, `Contract`

---

#### 6. **Job Posts** (`job_posts`)
Jobs posted by businesses.

**Key Fields:**
- `title`, `description`: Job details
- `jobType`: INDIVIDUAL | BULK
- `numberOfWorkersNeeded`: For bulk hiring
- `budgetMin`, `budgetMax`: Budget range
- `paymentType`: HOURLY | FIXED | DAILY
- `locationType`: ON_SITE | REMOTE | HYBRID
- `status`: DRAFT | ACTIVE | CLOSED | CANCELLED
- `urgency`: LOW | MEDIUM | HIGH | URGENT

**Relations:**
- Belongs to `BusinessProfile`
- Has many `JobApplication`, `Contract`

---

#### 7. **Job Applications** (`job_applications`)
Applications submitted by workers for jobs.

**Key Fields:**
- `coverLetter`: Worker's application letter
- `proposedRate`: Worker's proposed rate
- `status`: PENDING | REVIEWED | SHORTLISTED | REJECTED | ACCEPTED | WITHDRAWN

**Flow:**
1. Worker applies → PENDING
2. Business reviews → REVIEWED
3. Business shortlists → SHORTLISTED
4. Business accepts → ACCEPTED (creates Contract)
5. Business rejects → REJECTED

---

#### 8. **Contracts** (`contracts`)
Active work agreements between workers and businesses.

**Key Fields:**
- `contractType`: INDIVIDUAL | BULK_MEMBER
- `agreedRate`: Final agreed payment rate
- `status`: ACTIVE | COMPLETED | CANCELLED | DISPUTED

**Relations:**
- Links `JobPost`, `WorkerProfile`, `BusinessProfile`
- Has many `Payment`, `Review`

---

#### 9. **Payments** (`payments`)
Payment transactions for contracts.

**Key Fields:**
- `amount`: Payment amount
- `stripePaymentIntentId`: Stripe integration
- `status`: PENDING | PROCESSING | COMPLETED | FAILED | REFUNDED

**Payment Flow:**
1. Contract created → Payment PENDING
2. Business initiates → PROCESSING
3. Stripe confirms → COMPLETED
4. Work disputed → Can be REFUNDED

---

#### 10. **Reviews** (`reviews`)
Ratings and reviews between workers and businesses.

**Key Fields:**
- `rating`: 1-5 stars
- `comment`: Written review
- `reviewerType`: WORKER | BUSINESS

**Business Logic:**
- Both parties can review each other after contract completion
- Reviews are tied to specific contracts
- Average ratings are calculated and stored on profiles

---

### Supporting Entities

#### **Certifications** (`certifications`)
Professional certifications uploaded by workers.

#### **Portfolio Items** (`portfolio_items`) & **Portfolio Images** (`portfolio_images`)
Worker's past work showcase.

#### **Conversations** (`conversations`) & **Messages** (`messages`)
Real-time messaging between users.

#### **Notifications** (`notifications`)
System notifications for users.

#### **Saved Jobs** (`saved_jobs`)
Workers can save interesting jobs for later.

---

## Database Indexes

Optimized indexes for common queries:

```sql
-- Worker searches
CREATE INDEX idx_worker_location ON worker_profiles(location_city, location_state);
CREATE INDEX idx_worker_status ON worker_profiles(verification_status, availability_status);

-- Job searches
CREATE INDEX idx_job_status ON job_posts(status);
CREATE INDEX idx_job_published ON job_posts(published_at);

-- Application tracking
CREATE INDEX idx_application_status ON job_applications(status);
CREATE INDEX idx_application_worker ON job_applications(worker_id);

-- Contract management
CREATE INDEX idx_contract_status ON contracts(status);
```

---

## Common Queries

### Find Available Verified Workers by Skill

```typescript
const workers = await prisma.workerProfile.findMany({
  where: {
    verificationStatus: 'VERIFIED',
    availabilityStatus: 'AVAILABLE',
    skills: {
      some: {
        skill: {
          name: 'Plumbing',
        },
        proficiencyLevel: {
          in: ['INTERMEDIATE', 'EXPERT'],
        },
      },
    },
  },
  include: {
    user: true,
    skills: {
      include: {
        skill: true,
      },
    },
    portfolioItems: {
      include: {
        images: true,
      },
    },
  },
  orderBy: {
    ratingAverage: 'desc',
  },
});
```

### Find Active Jobs with Applications

```typescript
const jobs = await prisma.jobPost.findMany({
  where: {
    status: 'ACTIVE',
    businessId: businessId,
  },
  include: {
    business: true,
    applications: {
      where: {
        status: {
          in: ['PENDING', 'REVIEWED', 'SHORTLISTED'],
        },
      },
      include: {
        worker: {
          include: {
            user: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    },
    _count: {
      select: {
        applications: true,
      },
    },
  },
});
```

### Get Worker Dashboard Stats

```typescript
const workerStats = await prisma.workerProfile.findUnique({
  where: { userId: userId },
  include: {
    jobApplications: {
      where: {
        status: 'PENDING',
      },
    },
    contracts: {
      where: {
        status: 'ACTIVE',
      },
      include: {
        payments: true,
      },
    },
    _count: {
      select: {
        jobApplications: true,
        contracts: true,
      },
    },
  },
});
```

---

## Migrations

### Creating Migrations

When you modify the schema:

```bash
# Create a new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations in production
npx prisma migrate deploy
```

### Reset Database (Development Only)

```bash
# WARNING: This will delete all data
npx prisma migrate reset
```

---

## Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

## Data Validation

Validation is handled at multiple levels:

1. **Database Level**: Constraints, unique keys, foreign keys
2. **Prisma Level**: Type safety, required fields
3. **Application Level**: Zod schemas for API validation

Example Zod schema:

```typescript
import { z } from 'zod';

export const createWorkerProfileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  hourlyRate: z.number().min(0).max(10000),
  bio: z.string().max(1000).optional(),
  locationCity: z.string(),
  locationState: z.string(),
  skills: z.array(z.object({
    skillId: z.string().uuid(),
    proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'EXPERT']),
  })).min(1),
});
```

---

## Performance Optimization

### Connection Pooling

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Query Optimization

- Use `select` to fetch only needed fields
- Use `include` strategically
- Implement pagination for large datasets
- Use database indexes
- Consider Redis caching for frequently accessed data

---

## Security Best Practices

1. **Never expose Prisma Client to the frontend**
2. **Use parameterized queries** (Prisma does this automatically)
3. **Validate all user inputs** with Zod schemas
4. **Implement rate limiting** on API endpoints
5. **Use row-level security** for sensitive operations
6. **Encrypt sensitive data** at rest
7. **Audit trail**: Consider adding `createdBy`, `updatedBy` fields

---

## Troubleshooting

### Common Issues

**Issue**: Prisma Client out of sync
```bash
npx prisma generate
```

**Issue**: Migration conflicts
```bash
# Resolve conflicts in prisma/migrations directory
npx prisma migrate resolve --applied <migration-name>
```

**Issue**: Connection pool exhausted
```typescript
// Increase connection pool size
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 20
}
```

---

## Next Steps

1. ✅ Schema designed
2. ⬜ Set up Next.js project
3. ⬜ Create API routes
4. ⬜ Implement authentication with NextAuth
5. ⬜ Build worker/business dashboards
6. ⬜ Integrate Stripe payments
7. ⬜ Add real-time features
8. ⬜ Deploy to production

---

## Support

For questions or issues:
- Check Prisma documentation: https://www.prisma.io/docs
- PostgreSQL documentation: https://www.postgresql.org/docs/
