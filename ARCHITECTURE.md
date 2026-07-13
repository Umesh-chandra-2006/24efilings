# 24eFiling CRM - Architecture Documentation

## 📋 Table of Contents

1. [Database Module](#database-module)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [Data Flow Architecture](#data-flow-architecture)
7. [Key Features](#key-features)

---

## 🗄️ Database Module

### **Primary Database: Supabase (PostgreSQL)**

This project uses **Supabase** as the primary database and backend-as-a-service (BaaS) platform.

#### **Supabase Configuration**

- **Database Type**: PostgreSQL (via Supabase)
- **Client Library**: `@supabase/supabase-js` (v2.44.4)
- **Connection File**: `lib/supabaseClient.ts`
- **Environment Variables**: Stored in `env.tsx`
  - `SUPABASE_URL`: https://jblhzdtqrhfeawycecql.supabase.co
  - `SUPABASE_ANON_KEY`: Public anonymous key for client-side access

#### **Why Supabase?**

- **Real-time capabilities**: Live updates for CRM data
- **Built-in authentication**: User management with JWT tokens
- **Row Level Security (RLS)**: Fine-grained access control
- **PostgreSQL power**: ACID compliance, complex queries, triggers
- **Auto-generated APIs**: RESTful and GraphQL endpoints
- **Storage**: File upload capabilities for documents
- **Edge Functions**: Serverless functions for custom logic

---

## 🛠️ Technology Stack

### **Frontend**

| Technology         | Version  | Purpose                  |
| ------------------ | -------- | ------------------------ |
| **React**          | 19.2.0   | UI framework             |
| **TypeScript**     | 5.8.2    | Type safety              |
| **Vite**           | 6.2.0    | Build tool & dev server  |
| **TailwindCSS**    | 3.4.17   | Styling framework        |
| **Radix UI**       | Various  | Accessible UI components |
| **Framer Motion**  | 12.23.26 | Animations               |
| **Lucide React**   | 0.560.0  | Icon library             |
| **TanStack Table** | 8.21.3   | Data tables              |
| **Recharts**       | 3.5.1    | Charts & analytics       |

### **Backend & Database**

| Technology         | Version | Purpose              |
| ------------------ | ------- | -------------------- |
| **Supabase**       | 2.44.4  | BaaS platform        |
| **PostgreSQL**     | -       | Relational database  |
| **Edge Functions** | -       | Serverless functions |

### **Utilities & Libraries**

| Technology              | Purpose             |
| ----------------------- | ------------------- |
| **date-fns**            | Date manipulation   |
| **xlsx**                | Excel import/export |
| **jsPDF**               | PDF generation      |
| **@react-pdf/renderer** | PDF templates       |
| **@google/genai**       | AI integration      |

---

## 📁 Project Structure

```
24efiling-crm/
├── components/           # Reusable UI components
│   ├── data-table/      # Table components
│   ├── PaymentReceipt.tsx
│   └── [61 components]
│
├── pages/               # Page-level components
│   ├── UserManagement.tsx
│   └── [21 pages]
│
├── lib/                 # Core utilities
│   ├── supabaseClient.ts   # Database client & types
│   ├── utils.ts            # Helper functions
│   ├── scoring.ts          # Lead scoring logic
│   └── numberToWords.ts    # Number conversion
│
├── context/             # React context providers
│   └── [1 context]
│
├── hooks/               # Custom React hooks
│   └── [2 hooks]
│
├── supabase/            # Supabase configuration
│   └── functions/       # Edge functions
│       ├── create-super-admin/
│       ├── create-user/
│       └── delete-user/
│
├── assets/              # Static assets
├── public/              # Public files
│
├── *.sql                # Database migration scripts
│   ├── FIX_SETTINGS_RLS.sql
│   ├── SETUP_ASSETS_MODULE.sql
│   ├── UPDATE_RLS_HIERARCHY.sql
│   └── [30+ SQL files]
│
├── types.ts             # TypeScript type definitions
├── constants.ts         # Application constants
├── env.tsx              # Environment configuration
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

---

## 🗃️ Database Schema

### **Core Tables**

#### **1. profiles** (User Management)

```typescript
{
  id: string (UUID, FK to auth.users)
  name: string
  email: string
  phone_number?: string
  role: 'Super Admin' | 'Admin' | 'Sales Executive'
  department?: string
  branch_name?: string
  branch_id?: string
  is_active: boolean
  avatar_url?: string
  skills?: string[]
  created_at: timestamp
  last_updated: timestamp
  is_online?: boolean
  last_seen?: timestamp
}
```

#### **2. leads** (Lead Management)

```typescript
{
  id: string (UUID, PK)
  business_name: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  pan_number?: string
  residential_address?: string
  business_address?: string
  gender?: 'Male' | 'Female' | 'Other'
  service_requested: string
  status: 'New Lead' | 'Lead Confirmed' | 'Documents & Payments' | 'In-Progress' | 'Success' | 'Lost'
  priority: 'Hot' | 'Warm' | 'Cold'
  assigned_to?: UUID (FK to profiles)
  assigned_by?: UUID
  admin_id?: UUID
  branch_id?: string
  created_by?: UUID
  created_at: timestamp
  last_contacted: timestamp
  next_follow_up?: timestamp
  source: string
  notes?: string
  total_payment?: number
  advance_amount?: number
  remaining_amount?: number
  payments?: JSON (Payment[])
  service_sets?: JSON (ServiceSet[])
  avatar_url?: string
  score?: number
}
```

#### **3. customers** (Converted Leads)

```typescript
{
  id: string (UUID, PK)
  lead_id: string (FK to leads, CASCADE DELETE)
  name: string
  email: string
  phone: string
  pan_number?: string
  aadhar_number?: string
  gender?: string
  business_name: string
  service_name: string
  sub_service?: string
  lead_source: string
  assigned_to?: UUID
  branch_id?: string
  created_by?: UUID
  date_of_enroll: date
  date_of_completion: date
  residential_address?: string
  business_address?: string
  service_amount?: number
  tax_amount?: number
  discount_amount?: number
  total_amount?: number
  paid_amount?: number
  due_amount?: number
  payment_details?: JSON
  avatar_url?: string
  status?: string
  feedback?: string
  created_at: timestamp
  updated_at: timestamp
}
```

#### **4. activities** (Activity Tracking)

```typescript
{
  id: string (UUID, PK)
  lead_id: string (FK to leads)
  user_id: string (FK to profiles)
  type: 'Note' | 'Status Change' | 'Document Upload' | 'Call' | 'Email'
  content: string
  created_at: timestamp
}
```

#### **5. tasks** (Task Management)

```typescript
{
  id: string (UUID, PK)
  lead_id: string (FK to leads)
  content: string
  due_date?: timestamp
  is_completed: boolean
  completed_at?: timestamp
  created_by: UUID (FK to profiles)
  priority: 'High' | 'Medium' | 'Low'
  depends_on_task_id?: UUID
  created_at: timestamp
}
```

#### **6. documents** (Document Management)

```typescript
{
  id: string (UUID, PK)
  lead_id: string (FK to leads)
  name: string
  type: string
  url: string
  status: 'Pending' | 'Approved' | 'Rejected'
  uploaded_at: timestamp
  verification_notes?: string
}
```

#### **7. notifications** (User Notifications)

```typescript
{
  id: string (UUID, PK)
  user_id: string (FK to profiles)
  type: 'Lead Assigned' | 'Status Updated' | 'Note Added' | 'Document Uploaded'
  title: string
  message: string
  link?: JSON
  is_read: boolean
  created_at: timestamp
}
```

#### **8. user_activities** (Audit Log)

```typescript
{
  id: string (UUID, PK)
  user_id: string (FK to profiles)
  action: string
  details?: string
  timestamp: timestamp
}
```

---

## 🔐 Authentication & Authorization

### **Authentication Flow**

1. **Supabase Auth**: Built-in authentication system
2. **JWT Tokens**: Secure session management
3. **User Metadata**: Role and branch stored in JWT claims

### **Role-Based Access Control (RBAC)**

#### **Role Hierarchy**

```
Super Admin (Full System Access)
    ↓
Admin (Branch-Level Access)
    ↓
Sales Executive (Assigned Leads Only)
```

#### **Row Level Security (RLS) Policies**

**Profiles Table:**

- Super Admin: View all profiles
- Admin: View profiles in their branch
- All Users: View and manage own profile

**Leads Table:**

- Super Admin: Full access to all leads
- Admin: Access leads in their branch
- Sales Executive: Access only assigned leads

**Customers Table:**

- Super Admin: Full access
- Admin: Access customers in their branch
- Sales Executive: Access assigned customers

**Documents & Notifications:**

- Authenticated users can access relevant documents
- Users can only see their own notifications

### **Database Functions**

#### **1. get_my_claim(claim TEXT)**

```sql
-- Extracts JWT claims for RLS policies
-- Returns user_role, user_branch, user_branch_id
```

#### **2. handle_new_user()**

```sql
-- Trigger: Creates profile when user signs up
-- Auto-assigns role and branch from metadata
```

#### **3. handle_lead_creation_metadata()**

```sql
-- Trigger: Auto-populates lead metadata
-- Sets branch_id and admin_id based on creator role
```

#### **4. on_profile_change()**

```sql
-- Trigger: Syncs profile changes to auth.users metadata
-- Updates JWT claims when role/branch changes
```

---

## 🔄 Data Flow Architecture

### **Client → Database Flow**

```
User Action (React Component)
    ↓
Supabase Client (lib/supabaseClient.ts)
    ↓
Supabase API (REST/Realtime)
    ↓
PostgreSQL Database
    ↓
RLS Policies (Security Check)
    ↓
Database Triggers (Auto-population)
    ↓
Response to Client
    ↓
UI Update (React State)
```

### **Real-time Subscriptions**

```typescript
// Example: Real-time lead updates
supabase
  .from("leads")
  .on("INSERT", (payload) => {
    // Handle new lead
  })
  .on("UPDATE", (payload) => {
    // Handle lead update
  })
  .subscribe();
```

### **File Upload Flow**

```
User Uploads File
    ↓
Supabase Storage API
    ↓
Storage Bucket (documents)
    ↓
Public URL Generated
    ↓
URL Stored in documents table
```

---

## ⚙️ Key Features

### **1. Lead Management**

- Create, update, and track leads
- Lead scoring algorithm
- Status workflow management
- Assignment to sales executives
- Activity timeline

### **2. Customer Management**

- Convert leads to customers
- Service set management
- Payment tracking
- Document verification
- Feedback collection

### **3. User Management**

- Role-based access control
- Branch-based organization
- User activity tracking
- Online status monitoring

### **4. Payment & Billing**

- Multiple payment methods
- Tax calculation
- Discount management
- Receipt generation (PDF)
- Payment history

### **5. Document Management**

- File upload to Supabase Storage
- Document verification workflow
- Status tracking (Pending/Approved/Rejected)

### **6. Reporting & Analytics**

- Sales reports
- Lead conversion metrics
- Payment analytics
- User performance tracking

### **7. Task Management**

- Task assignment
- Priority levels
- Due date tracking
- Task dependencies

### **8. Notifications**

- Real-time notifications
- Lead assignment alerts
- Status change notifications
- Document upload alerts

---

## 🔧 Database Migrations

The project includes 30+ SQL migration files for:

- Schema updates
- RLS policy fixes
- New feature additions
- Data migrations
- Performance optimizations

**Key Migration Files:**

- `SETUP_SERVICES.sql` - Service catalog setup
- `SETUP_ASSETS_MODULE.sql` - Asset management
- `FIX_SETTINGS_RLS.sql` - Settings security
- `UPDATE_RLS_HIERARCHY.sql` - Role hierarchy
- `FIX_LEADS_RLS_FINAL.sql` - Lead access control

---

## 📊 Database Design Patterns

### **1. Soft Delete**

- `deleted_at` timestamp for reversible deletions
- Used in assets and other critical tables

### **2. Audit Trail**

- `user_activities` table logs all actions
- Timestamp tracking on all tables

### **3. JSON Columns**

- `payments` (JSON array in leads)
- `service_sets` (JSON array)
- `payment_details` (JSON object)
- Flexible schema for complex data

### **4. Foreign Key Cascades**

- `customers.lead_id` → `ON DELETE CASCADE`
- Maintains referential integrity

### **5. Triggers**

- Auto-populate metadata on insert
- Sync profile changes to auth
- Maintain data consistency

---

## 🚀 Performance Optimizations

### **Database Indexes**

- Primary keys (UUID)
- Foreign key indexes
- Status and role columns
- Timestamp columns for sorting

### **Query Optimization**

- Use of database functions
- Efficient RLS policies
- Selective column fetching
- Pagination support

### **Caching Strategy**

- React Query for data caching
- Supabase real-time for live updates
- Local state management

---

## 🔒 Security Features

1. **Row Level Security (RLS)**: All tables protected
2. **JWT Authentication**: Secure session management
3. **Role-Based Access**: Hierarchical permissions
4. **SQL Injection Protection**: Parameterized queries
5. **HTTPS Only**: Encrypted data transmission
6. **Environment Variables**: Sensitive data protection

---

## 📝 Development Workflow

### **Local Development**

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 3000)
```

### **Database Setup**

1. Create Supabase project
2. Run SQL migration scripts
3. Configure RLS policies
4. Set up storage buckets
5. Deploy edge functions

### **Environment Configuration**

- Update `env.tsx` with Supabase credentials
- Configure `.env.local` for API keys

---

## 🎯 Future Enhancements

- [ ] GraphQL API integration
- [ ] Advanced analytics dashboard
- [ ] WhatsApp integration
- [ ] Email automation
- [ ] Mobile app (React Native)
- [ ] Multi-tenant architecture
- [ ] Advanced reporting with BI tools

---

**Last Updated**: January 30, 2026  
**Version**: 1.0.0  
**Maintained By**: AccinfordOfficial Team
