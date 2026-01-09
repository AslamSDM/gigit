# GigIt Platform - Setup Guide

Welcome to the GigIt B2B Skilled Worker Platform! This guide will help you get the project up and running.

## ✅ What's Already Done

- ✅ Next.js 16.1.1 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS 4
- ✅ shadcn/ui components (Button, Card)
- ✅ Prisma ORM with PostgreSQL schema
- ✅ Database seed file with demo data
- ✅ Beautiful landing page
- ✅ Responsive design

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update with your PostgreSQL database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/gigit_platform?schema=public"
```

### 3. Set Up Database

```bash
# Generate Prisma Client
pnpm db:generate

# Run migrations (creates tables)
pnpm db:migrate

# Seed database with initial data (skills & demo accounts)
pnpm db:seed
```

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page!

## 📊 Database

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gigit.com | Admin@123 |
| Worker | worker@example.com | Worker@123 |
| Business | business@example.com | Business@123 |

### View Database

```bash
pnpm db:studio
```

This opens Prisma Studio at `http://localhost:5555` where you can view and edit data.

## 📁 Project Structure

```
gigit/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   └── utils.ts             # Utility functions (cn)
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data
├── public/                  # Static assets
├── components.json          # shadcn/ui config
├── next.config.ts           # Next.js config
├── tailwind.config.ts       # Tailwind config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

## 🎨 Adding shadcn/ui Components

To add more shadcn/ui components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add form
# ... etc
```

Or manually copy from https://ui.shadcn.com/docs/components

## 🔧 Available Scripts

```bash
# Development
pnpm dev                 # Start dev server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint

# Database
pnpm db:generate        # Generate Prisma Client
pnpm db:migrate         # Run migrations
pnpm db:seed            # Seed database
pnpm db:studio          # Open Prisma Studio
pnpm db:reset           # Reset database (⚠️  deletes data)
pnpm db:push            # Push schema without migration
```

## 📚 Next Steps

### 1. Set Up Authentication (NextAuth.js)

```bash
pnpm add next-auth @auth/prisma-adapter
pnpm add -D @types/bcryptjs bcryptjs
```

### 2. Install Form Libraries

```bash
pnpm add react-hook-form @hookform/resolvers zod
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add textarea
```

### 3. Add More UI Components

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add tabs
```

### 4. Set Up File Upload (AWS S3 or Cloudinary)

```bash
pnpm add @aws-sdk/client-s3
# or
pnpm add cloudinary
```

### 5. Set Up Payments (Stripe)

```bash
pnpm add stripe @stripe/stripe-js
```

### 6. Add Real-time Features (Pusher)

```bash
pnpm add pusher pusher-js
```

## 🏗️ Building Features

### Phase 1: Authentication (Recommended Next)
- [ ] Set up NextAuth.js
- [ ] Create login/register pages
- [ ] Implement user type selection (Worker/Business)
- [ ] Add email verification
- [ ] Create protected routes

### Phase 2: User Profiles
- [ ] Worker profile creation
- [ ] Business profile creation
- [ ] Profile editing
- [ ] Skills selection
- [ ] Portfolio upload

### Phase 3: Job Management
- [ ] Job posting form
- [ ] Job listing page
- [ ] Job detail page
- [ ] Job search & filters
- [ ] Bulk job posting

### Phase 4: Applications
- [ ] Job application form
- [ ] Application management
- [ ] Worker shortlisting
- [ ] Application status tracking

### Phase 5: Contracts & Payments
- [ ] Contract creation
- [ ] Stripe payment integration
- [ ] Escrow system
- [ ] Payment release
- [ ] Invoice generation

### Phase 6: Communication
- [ ] Real-time messaging
- [ ] Notifications system
- [ ] Email notifications

### Phase 7: Reviews & Ratings
- [ ] Review submission
- [ ] Rating calculation
- [ ] Review display

## 🎯 Key Features to Implement

### Worker Dashboard
- Profile completion progress
- Active job applications
- Active contracts
- Earnings overview
- Reviews received

### Business Dashboard
- Active job posts
- Applications received
- Active contracts
- Payment history
- Workers hired

### Job Posting
- Title & description
- Required skills
- Budget range
- Location
- Job type (Individual/Bulk)
- Number of workers needed (for bulk)
- Start date & duration

### Worker Profile
- Personal information
- Skills & proficiency levels
- Certifications (with verification)
- Portfolio with images
- Work history
- Reviews & ratings

## 🔒 Security Checklist

- [ ] Implement CSRF protection
- [ ] Add rate limiting
- [ ] Validate all user inputs
- [ ] Sanitize file uploads
- [ ] Use environment variables for secrets
- [ ] Implement proper authentication
- [ ] Add authorization checks
- [ ] Enable HTTPS in production

## 📱 Production Deployment

### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Environment Variables (Vercel)
Add these in Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `AWS_ACCESS_KEY_ID`
- etc.

### Database (Production)
Consider these PostgreSQL hosting options:
- Neon (Serverless PostgreSQL)
- Supabase
- AWS RDS
- Railway
- PlanetScale

## 🐛 Troubleshooting

### Prisma Client Issues
```bash
pnpm db:generate
```

### Port Already in Use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

### Database Connection Errors
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify credentials

### TypeScript Errors
```bash
# Restart TypeScript server in VS Code
# Cmd+Shift+P → TypeScript: Restart TS Server
```

## 📖 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

## 🤝 Contributing

1. Create feature branches
2. Write tests
3. Follow existing code style
4. Update documentation
5. Submit pull requests

## 📄 License

MIT License

---

**Happy Coding! 🚀**

For questions or issues, check the documentation files:
- `DATABASE.md` - Database schema and queries
- `DATABASE_DIAGRAM.md` - Visual diagrams
- `QUICK_START.md` - Prisma command reference
