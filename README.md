<div align="center">
  <img src="./public/taskflow.png" alt="TaskFlow Logo" width="120" height="120" />
  <h1>TaskFlow</h1>
  <p><strong>A Next-Generation Freelance & Service Management Platform</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vitest-Coverage-6E9F18?style=for-the-badge&logo=vitest" alt="Vitest" />
  </p>
</div>

<hr />

## 📖 Overview

**TaskFlow** is an end-to-end administration and client portal system specifically built for freelancers, agencies, and service providers. It acts as the central unifier bridging the Admin Dashboard and the public Tracking Interface. Built dynamically on **Next.js 15 App Router**, it offers real-time order tracking, rigorous JWT-based secure auth, seamless API integration with **n8n Pipelines**, and powerful state management mapped via **Prisma ORM**.

## ✨ Key Features

- **Public Tracking Portal**: Clients can track their project status securely via generated `TF-XXXX` tracking IDs.
- **Admin Command Center**: A robust, Supabase-inspired minimalistic dashboard for managing Users, Clients, Tasks, Invoices, and Audit Logs.
- **Task Assignments**: Project Managers can allocate tasks directly to dedicated team members (Admins).
- **Automated n8n Ecosystem**: Out-of-the-box native webhook (`POST`, `PATCH`) endpoints to synchronize data and fire Telegram alerts automatically upon status shifts.
- **File Management**: Built-in logic to upload and manage restricted Deliverables and public Payment Proofs seamlessly.
- **Fortified Security**: Leverages `jose` standard library for edge-compatible JWT session encryption.

## 🛠 Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Database ORM**: Prisma (PostgreSQL support)
- **Styling**: Tailwind CSS & `shadcn/ui` based components
- **Testing**: [Vitest](https://vitest.dev/) with `vitest-mock-extended` & `jsdom`
- **CI/CD**: GitHub Actions

---

## 🚀 Getting Started

Follow these instructions to set up your local development environment.

### 1. Prerequisites

- **Node.js** (v20 LTS recommended)
- **NPM** or **Yarn** or **pnpm**
- **Git**

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/EgiStr/taskflow-app.git
cd taskflow-app
npm install
```

### 3. Environment Variables

Copy the `.env.example` file to create your local `.env` configuration:

```bash
cp .env.example .env
```

Ensure the following critical environment variables are set:

```env
# Database Credentials
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow_db"
DIRECT_URL="postgresql://user:password@localhost:5432/taskflow_db"

# JWT Encryption
# Generate a secure 32-character base64 string
JWT_SECRET="your_long_secure_string_here"

# Webhooks & Integrations
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/..."
API_AUTH_KEY="your_api_key_used_to_authenticate_n8n_"
```

### 4. Database Setup

Synchronize your Prisma schema with your database and run the seeds to create your initial Superadmin account:

```bash
npx prisma generate
npx prisma db push
npm run seed
```

> **Note:** The default seed data usually comprises a master account (`admin@taskflow.com` / `admin123`). Be sure to customize `prisma/seed.cjs` prior to deployment.

### 5. Running the Application

Start the local development server:

```bash
npm run dev
```

Your system is now active on [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing (Vitest)

TaskFlow incorporates a rigorous **100% Mocked Database Testing Framework** using Vitest to enforce CI compliance without mutating or accessing your actual production data.

To execute the entire unit testing suite (Utilities, Node polyfills, Server Actions, & Route Handler APIs):

```bash
npm run test -- --run
```

---

## ⚙️ CI / CD (Continuous Integration)

This repository strictly implements GitHub Actions for pre-deployment checks (`.github/workflows/ci.yml`).
The pipeline intercepts all Pull Requests and merges to the `main` or `master` branch by strictly assessing:
1. `npm ci` dependencies integrity.
2. `npx tsc --noEmit` Strict Typescript checking.
3. `npm run lint` Code formatting validation.
4. `npm run test` Vitest runtime assurance.
5. `npm run build` Next.js Cloud build simulation.

## 📄 Licensing & Authors

Proprietary Software designed for exclusive freelance service providers.
*Written with care for scalability and UI/UX developer-friendliness.*
