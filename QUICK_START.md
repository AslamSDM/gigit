# Quick Start Guide - Prisma Commands

## Essential Commands Cheat Sheet

### Initial Setup

```bash
# 1. Install dependencies
npm install prisma @prisma/client
npm install -D typescript ts-node @types/node @types/bcrypt bcrypt

# 2. Generate Prisma Client
npx prisma generate

# 3. Create and apply migration
npx prisma migrate dev --name init

# 4. Seed database with initial data
npx prisma db seed

# 5. Open Prisma Studio (database GUI)
npx prisma studio
```

---

## Development Workflow

### Working with Migrations

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name add_new_feature

# View migration status
npx prisma migrate status

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Apply migrations in production
npx prisma migrate deploy
```

### Database Operations

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull database schema into Prisma (reverse engineering)
npx prisma db pull

# Push schema changes without migration (dev only)
npx prisma db push
```

### Prisma Studio

```bash
# Open visual database editor
npx prisma studio
# Opens on http://localhost:5555
```

---

## Package.json Scripts

Add these to your `package.json` for convenience:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "db:push": "prisma db push",
    "db:format": "prisma format"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Then run:
```bash
npm run db:migrate
npm run db:seed
npm run db:studio
```

---

## Prisma Client Usage

### Setup Prisma Client (lib/prisma.ts)

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Common CRUD Operations

```typescript
import { prisma } from '@/lib/prisma';

// CREATE
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    passwordHash: hashedPassword,
    userType: 'WORKER',
  },
});

// CREATE with relations
const worker = await prisma.workerProfile.create({
  data: {
    userId: user.id,
    firstName: 'John',
    lastName: 'Doe',
    skills: {
      create: [
        {
          skillId: skillId,
          proficiencyLevel: 'EXPERT',
        },
      ],
    },
  },
});

// READ (find unique)
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { workerProfile: true },
});

// READ (find many with filters)
const workers = await prisma.workerProfile.findMany({
  where: {
    verificationStatus: 'VERIFIED',
    availabilityStatus: 'AVAILABLE',
    ratingAverage: { gte: 4.0 },
  },
  include: {
    skills: {
      include: { skill: true },
    },
  },
  orderBy: {
    ratingAverage: 'desc',
  },
  take: 10,
});

// UPDATE
const updatedWorker = await prisma.workerProfile.update({
  where: { id: workerId },
  data: {
    hourlyRate: 60.00,
    availabilityStatus: 'BUSY',
  },
});

// DELETE
await prisma.workerProfile.delete({
  where: { id: workerId },
});

// COUNT
const totalWorkers = await prisma.workerProfile.count({
  where: {
    verificationStatus: 'VERIFIED',
  },
});
```

---

## Advanced Queries

### Filtering & Relations

```typescript
// Find workers with specific skills
const plumbers = await prisma.workerProfile.findMany({
  where: {
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
});

// Find jobs with filters
const jobs = await prisma.jobPost.findMany({
  where: {
    status: 'ACTIVE',
    budgetMin: { gte: 50 },
    budgetMax: { lte: 100 },
    jobLocationCity: 'New York',
  },
  include: {
    business: true,
    _count: {
      select: { applications: true },
    },
  },
});
```

### Pagination

```typescript
const page = 1;
const pageSize = 20;

const [jobs, totalCount] = await Promise.all([
  prisma.jobPost.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  }),
  prisma.jobPost.count({
    where: { status: 'ACTIVE' },
  }),
]);

const totalPages = Math.ceil(totalCount / pageSize);
```

### Aggregation

```typescript
// Get average rating
const avgRating = await prisma.workerProfile.aggregate({
  _avg: {
    ratingAverage: true,
  },
  where: {
    verificationStatus: 'VERIFIED',
  },
});

// Group by and count
const skillCounts = await prisma.workerSkill.groupBy({
  by: ['skillId'],
  _count: true,
  orderBy: {
    _count: {
      skillId: 'desc',
    },
  },
});
```

### Transactions

```typescript
// Create contract and update job application status
const result = await prisma.$transaction(async (tx) => {
  // Create contract
  const contract = await tx.contract.create({
    data: {
      jobPostId: jobId,
      workerId: workerId,
      businessId: businessId,
      agreedRate: 60.00,
      startDate: new Date(),
      status: 'ACTIVE',
    },
  });

  // Update application status
  await tx.jobApplication.update({
    where: { id: applicationId },
    data: { status: 'ACCEPTED' },
  });

  // Create notification
  await tx.notification.create({
    data: {
      userId: workerId,
      type: 'JOB_ACCEPTED',
      title: 'Job Accepted!',
      message: 'Your application has been accepted',
    },
  });

  return contract;
});
```

---

## Environment Variables

### .env File

```env
# Required
DATABASE_URL="postgresql://user:pass@localhost:5432/gigit_platform?schema=public"

# Optional for development
DATABASE_URL="postgresql://user:pass@localhost:5432/gigit_platform?schema=public&connection_limit=5"
```

### Production (.env.production)

```env
# Use connection pooling for serverless
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:pass@host:5432/db" # For migrations
```

---

## Troubleshooting

### Common Issues

**Error: "Prisma Client not generated"**
```bash
npx prisma generate
```

**Error: "Migration conflicts"**
```bash
# Resolve manually in prisma/migrations/
npx prisma migrate resolve --applied <migration-name>
```

**Error: "Connection pool timeout"**
```typescript
// Increase connection pool
datasource db {
  url = env("DATABASE_URL")
  // Add ?connection_limit=10 to DATABASE_URL
}
```

**Prisma Client out of sync with schema**
```bash
# After changing schema
npx prisma generate
# Restart your dev server
```

---

## Performance Tips

### 1. Use Select instead of Include when possible
```typescript
// ❌ Fetches all fields
const user = await prisma.user.findUnique({
  where: { id },
  include: { workerProfile: true },
});

// ✅ Fetches only needed fields
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    email: true,
    workerProfile: {
      select: {
        firstName: true,
        lastName: true,
      },
    },
  },
});
```

### 2. Use Indexes
Already defined in schema for common queries on:
- User lookups (email)
- Worker searches (location, status)
- Job searches (status, type)
- Applications (worker, status)

### 3. Connection Pooling
```typescript
// For serverless/edge environments
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());
```

---

## Next Steps

1. ✅ Database schema created
2. ⬜ Run `npm install prisma @prisma/client`
3. ⬜ Configure `.env` with your database URL
4. ⬜ Run `npx prisma migrate dev --name init`
5. ⬜ Run `npx prisma db seed`
6. ⬜ Open `npx prisma studio` to verify data
7. ⬜ Start building your Next.js application!

---

## Useful Links

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Examples](https://github.com/prisma/prisma-examples)

---

**Happy coding! 🎉**
