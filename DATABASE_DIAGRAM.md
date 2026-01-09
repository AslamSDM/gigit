# Database Entity Relationship Diagram

## Full Schema Diagram

```mermaid
erDiagram
    users ||--o| worker_profiles : "has"
    users ||--o| business_profiles : "has"
    users ||--o{ messages : "sends"
    users ||--o{ notifications : "receives"
    users ||--o{ conversation_participants : "participates"
    users ||--o{ reviews : "gives"
    users ||--o{ reviews : "receives"

    worker_profiles ||--o{ worker_skills : "has"
    worker_profiles ||--o{ certifications : "has"
    worker_profiles ||--o{ portfolio_items : "has"
    worker_profiles ||--o{ job_applications : "submits"
    worker_profiles ||--o{ contracts : "works on"
    worker_profiles ||--o{ saved_jobs : "saves"

    business_profiles ||--o{ job_posts : "creates"
    business_profiles ||--o{ contracts : "hires for"

    skills ||--o{ worker_skills : "assigned to"

    portfolio_items ||--o{ portfolio_images : "contains"

    job_posts ||--o{ job_applications : "receives"
    job_posts ||--o{ contracts : "results in"
    job_posts ||--o{ saved_jobs : "saved by"

    contracts ||--o{ payments : "has"
    contracts ||--o{ reviews : "generates"

    conversations ||--o{ conversation_participants : "includes"
    conversations ||--o{ messages : "contains"

    users {
        uuid id PK
        string email
        string password_hash
        enum user_type
        boolean email_verified
        timestamp created_at
    }

    worker_profiles {
        uuid id PK
        uuid user_id FK
        string first_name
        string last_name
        decimal hourly_rate
        enum availability_status
        enum verification_status
        decimal rating_average
        int total_jobs_completed
    }

    business_profiles {
        uuid id PK
        uuid user_id FK
        string company_name
        string company_registration_number
        enum company_size
        enum verification_status
    }

    skills {
        uuid id PK
        string name
        string category
    }

    worker_skills {
        uuid id PK
        uuid worker_id FK
        uuid skill_id FK
        enum proficiency_level
        int years_of_experience
    }

    job_posts {
        uuid id PK
        uuid business_id FK
        string title
        text description
        enum job_type
        int number_of_workers_needed
        decimal budget_min
        decimal budget_max
        enum payment_type
        enum status
    }

    job_applications {
        uuid id PK
        uuid job_post_id FK
        uuid worker_id FK
        text cover_letter
        enum status
        timestamp applied_at
    }

    contracts {
        uuid id PK
        uuid job_post_id FK
        uuid worker_id FK
        uuid business_id FK
        decimal agreed_rate
        enum status
        date start_date
        date end_date
    }

    payments {
        uuid id PK
        uuid contract_id FK
        decimal amount
        string stripe_payment_intent_id
        enum status
    }

    reviews {
        uuid id PK
        uuid contract_id FK
        uuid reviewer_id FK
        uuid reviewee_id FK
        int rating
        text comment
    }

    certifications {
        uuid id PK
        uuid worker_id FK
        string name
        string issuing_organization
        enum verification_status
    }

    portfolio_items {
        uuid id PK
        uuid worker_id FK
        string title
        text description
    }

    portfolio_images {
        uuid id PK
        uuid portfolio_item_id FK
        string image_url
        int display_order
    }

    conversations {
        uuid id PK
        timestamp created_at
    }

    conversation_participants {
        uuid id PK
        uuid conversation_id FK
        uuid user_id FK
    }

    messages {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text content
        boolean is_read
    }

    notifications {
        uuid id PK
        uuid user_id FK
        enum type
        string title
        text message
        boolean is_read
    }

    saved_jobs {
        uuid id PK
        uuid worker_id FK
        uuid job_post_id FK
    }
```

---

## Core Workflows

### 1. Worker Onboarding Flow

```mermaid
flowchart TD
    A[User Registers] --> B[Create User Record]
    B --> C[Create Worker Profile]
    C --> D[Add Skills]
    D --> E[Upload Certifications]
    E --> F[Create Portfolio]
    F --> G[Verification Review]
    G --> H{Approved?}
    H -->|Yes| I[Account Active]
    H -->|No| J[Request More Info]
    J --> C
```

### 2. Job Posting & Hiring Flow

```mermaid
flowchart TD
    A[Business Creates Job Post] --> B{Job Type?}
    B -->|Individual| C[Post Single Position]
    B -->|Bulk| D[Post Multiple Positions]
    C --> E[Workers Apply]
    D --> E
    E --> F[Business Reviews Applications]
    F --> G[Shortlist Candidates]
    G --> H[Send Job Offers]
    H --> I{Worker Accepts?}
    I -->|Yes| J[Create Contract]
    I -->|No| K[Offer to Next Candidate]
    J --> L[Escrow Payment]
    L --> M[Work Begins]
    M --> N[Work Completed]
    N --> O[Release Payment]
    O --> P[Both Parties Review]
```

### 3. Payment Flow

```mermaid
flowchart TD
    A[Contract Created] --> B[Business Deposits to Escrow]
    B --> C[Stripe Holds Payment]
    C --> D[Worker Completes Job]
    D --> E[Worker Requests Payment]
    E --> F{Business Approves?}
    F -->|Yes| G[Release from Escrow]
    F -->|No| H[Dispute Raised]
    H --> I[Admin Mediation]
    I --> J{Resolution}
    J -->|Worker Favor| G
    J -->|Business Favor| K[Refund Business]
    G --> L[Calculate Platform Fee]
    L --> M[Transfer to Worker]
    M --> N[Payment Complete]
```

### 4. Application Status Flow

```mermaid
stateDiagram-v2
    [*] --> PENDING: Worker Applies
    PENDING --> REVIEWED: Business Views
    REVIEWED --> SHORTLISTED: Business Shortlists
    REVIEWED --> REJECTED: Business Rejects
    SHORTLISTED --> ACCEPTED: Business Sends Offer
    SHORTLISTED --> REJECTED: Business Changes Mind
    ACCEPTED --> [*]: Contract Created
    REJECTED --> [*]
    PENDING --> WITHDRAWN: Worker Withdraws
    REVIEWED --> WITHDRAWN: Worker Withdraws
    SHORTLISTED --> WITHDRAWN: Worker Withdraws
    WITHDRAWN --> [*]
```

### 5. Contract Lifecycle

```mermaid
stateDiagram-v2
    [*] --> ACTIVE: Application Accepted
    ACTIVE --> COMPLETED: Work Finished
    ACTIVE --> CANCELLED: Either Party Cancels
    ACTIVE --> DISPUTED: Issue Raised
    DISPUTED --> COMPLETED: Resolved in Worker Favor
    DISPUTED --> CANCELLED: Resolved in Business Favor
    COMPLETED --> [*]: Payment Released
    CANCELLED --> [*]: Payment Refunded
```

---

## Key Relationships Explained

### 1. User -> Profile (Polymorphic)
- One `User` can have either a `WorkerProfile` OR `BusinessProfile`
- Determined by `user_type` enum
- Enforced at application level (not database constraint)

### 2. Worker -> Skills (Many-to-Many)
- Workers can have multiple skills
- Skills can belong to multiple workers
- Junction table: `worker_skills`
- Includes metadata: `proficiency_level`, `years_of_experience`

### 3. Job -> Applications (One-to-Many)
- One job receives many applications
- Each application linked to one worker
- Unique constraint: one worker can only apply once per job

### 4. Contract -> Payments (One-to-Many)
- One contract can have multiple payments (milestone payments)
- Each payment linked to one contract
- Tracks payment status and Stripe integration

### 5. Contract -> Reviews (One-to-Many, Bidirectional)
- One contract can have 2 reviews (worker reviews business, business reviews worker)
- Each review linked to one contract
- Unique constraint: one review per reviewer per contract

---

## Data Flow Examples

### Example 1: Creating a Complete Worker Profile

```typescript
// 1. Create user account
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    passwordHash: hashedPassword,
    userType: 'WORKER',
    emailVerified: true,
  },
});

// 2. Create worker profile with skills
const workerProfile = await prisma.workerProfile.create({
  data: {
    userId: user.id,
    firstName: 'John',
    lastName: 'Doe',
    hourlyRate: 50.00,
    locationCity: 'New York',
    locationState: 'NY',
    skills: {
      create: [
        {
          skillId: plumbingSkillId,
          proficiencyLevel: 'EXPERT',
          yearsOfExperience: 10,
        },
      ],
    },
    certifications: {
      create: [
        {
          name: 'Licensed Plumber',
          issuingOrganization: 'State Board',
          issueDate: new Date('2015-01-01'),
        },
      ],
    },
  },
});
```

### Example 2: Bulk Hiring Process

```typescript
// 1. Create bulk job post
const bulkJob = await prisma.jobPost.create({
  data: {
    businessId: businessId,
    title: 'Need 10 Plumbers for Commercial Project',
    jobType: 'BULK',
    numberOfWorkersNeeded: 10,
    budgetMin: 50,
    budgetMax: 75,
    // ... other fields
  },
});

// 2. Workers apply
// (Multiple workers create job_applications)

// 3. Business bulk accepts 10 workers
const acceptedApplications = await prisma.jobApplication.findMany({
  where: {
    jobPostId: bulkJob.id,
    status: 'SHORTLISTED',
  },
  take: 10,
});

// 4. Create contracts for all accepted workers
const contracts = await prisma.contract.createMany({
  data: acceptedApplications.map(app => ({
    jobPostId: bulkJob.id,
    workerId: app.workerId,
    businessId: businessId,
    contractType: 'BULK_MEMBER',
    agreedRate: 60.00,
    startDate: new Date(),
  })),
});
```

---

## Indexing Strategy

### High-Priority Indexes (Already in Schema)

```sql
-- Worker discovery
CREATE INDEX idx_worker_location ON worker_profiles(location_city, location_state);
CREATE INDEX idx_worker_verification ON worker_profiles(verification_status);
CREATE INDEX idx_worker_availability ON worker_profiles(availability_status);

-- Job search
CREATE INDEX idx_job_status ON job_posts(status);
CREATE INDEX idx_job_type ON job_posts(job_type);
CREATE INDEX idx_job_published ON job_posts(published_at);

-- Application tracking
CREATE INDEX idx_application_worker ON job_applications(worker_id);
CREATE INDEX idx_application_status ON job_applications(status);

-- Contract management
CREATE INDEX idx_contract_worker ON contracts(worker_id);
CREATE INDEX idx_contract_business ON contracts(business_id);
CREATE INDEX idx_contract_status ON contracts(status);

-- Messaging
CREATE INDEX idx_message_conversation ON messages(conversation_id);
CREATE INDEX idx_message_sender ON messages(sender_id);

-- Notifications
CREATE INDEX idx_notification_user ON notifications(user_id);
CREATE INDEX idx_notification_read ON notifications(is_read);
```

### Additional Composite Indexes (Consider Adding)

```sql
-- Find available verified workers in location
CREATE INDEX idx_worker_search ON worker_profiles(
  verification_status,
  availability_status,
  location_city
);

-- Find active jobs by business
CREATE INDEX idx_business_active_jobs ON job_posts(
  business_id,
  status
) WHERE status = 'ACTIVE';

-- Worker application history
CREATE INDEX idx_worker_applications ON job_applications(
  worker_id,
  status,
  applied_at DESC
);
```

---

## Performance Considerations

### Query Optimization Tips

1. **Use select instead of include when possible**
   ```typescript
   // ❌ Fetches all fields
   const worker = await prisma.workerProfile.findUnique({
     where: { id },
     include: { skills: true }
   });

   // ✅ Fetches only needed fields
   const worker = await prisma.workerProfile.findUnique({
     where: { id },
     select: {
       firstName: true,
       lastName: true,
       hourlyRate: true,
       skills: {
         select: {
           skill: {
             select: { name: true }
           }
         }
       }
     }
   });
   ```

2. **Implement pagination**
   ```typescript
   const jobs = await prisma.jobPost.findMany({
     skip: (page - 1) * limit,
     take: limit,
     orderBy: { createdAt: 'desc' }
   });
   ```

3. **Use database-level filtering**
   ```typescript
   // ✅ Filter in database
   const workers = await prisma.workerProfile.findMany({
     where: {
       ratingAverage: { gte: 4.0 },
       totalJobsCompleted: { gte: 10 }
     }
   });
   ```

4. **Batch operations when possible**
   ```typescript
   // Instead of multiple creates, use createMany
   await prisma.notification.createMany({
     data: users.map(user => ({
       userId: user.id,
       type: 'SYSTEM',
       title: 'Update',
       message: 'New feature released!'
     }))
   });
   ```

---

This diagram and documentation should help you understand the complete database structure and relationships in your gig platform!
