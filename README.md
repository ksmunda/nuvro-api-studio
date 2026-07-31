# 🚀 NUVRO API Studio

**NUVRO API Studio** is a modern, open-source API development, testing, and management platform designed for developers, teams, and API builders.

It provides a powerful workspace for creating, organizing, executing, testing, and managing API requests — with a clean developer-focused interface.

The project is being built with **React, TypeScript, Node.js, Express, PostgreSQL, and Prisma**, with a future roadmap for **Windows, macOS, and Linux desktop applications**.

---

## ✨ Vision

NUVRO API Studio aims to become a complete API development workspace that helps developers:

* Build and execute API requests
* Organize APIs into collections and folders
* Manage environments and variables
* Work with authentication
* Inspect API responses
* Save request history
* Create automated API tests
* Import and export API collections
* Run collections
* Collaborate with teams
* Work from the web or desktop

The initial focus is the **web application**.

Desktop applications for **Windows, macOS, and Linux** are planned for future releases.

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack Query
* Zustand
* React Hook Form
* Zod
* Monaco Editor

### Backend

* Node.js
* TypeScript
* Express.js
* Zod

### Database

* PostgreSQL
* Prisma ORM

### Development

* pnpm
* Turborepo
* ESLint
* Prettier
* Vitest
* Supertest
* Playwright

### Infrastructure

* Docker
* GitHub Actions

### Future Desktop Applications

* Tauri
* Windows
* macOS
* Linux

---

# 🎯 Current Status

> 🚧 **NUVRO API Studio is currently under active development.**

The project is being developed incrementally, starting with the web application.

### Current development focus

* [x] Project architecture
* [x] Monorepo setup
* [x] TypeScript configuration
* [ ] Web application
* [ ] API request builder
* [ ] API request execution
* [ ] Response viewer
* [ ] Collections
* [ ] Environments
* [ ] Authentication
* [ ] Request history
* [ ] API testing
* [ ] Import/export
* [ ] Collection runner
* [ ] Team workspaces
* [ ] Desktop application

---

# 📋 Features

## API Request Builder

Create and execute HTTP requests using:

* GET
* POST
* PUT
* PATCH
* DELETE
* HEAD
* OPTIONS

Configure:

* URL
* Query parameters
* Headers
* Request body
* Form data
* URL-encoded data
* Authentication

---

## 📁 Collections

Organize API requests into collections and folders.

Example:

```text
My Workspace
│
├── Authentication
│   ├── Login
│   ├── Register
│   └── Refresh Token
│
├── Users
│   ├── Get Users
│   ├── Get User
│   ├── Create User
│   ├── Update User
│   └── Delete User
│
└── Products
    ├── Get Products
    ├── Get Product
    └── Create Product
```

---

## 🌎 Environments

Create multiple environments for different deployment stages.

Example:

```text
Local
Staging
Production
```

Environment variables:

```text
BASE_URL=https://api.example.com
API_TOKEN=your-token
CLIENT_ID=your-client-id
```

Use variables in requests:

```text
{{BASE_URL}}/users
```

---

## 🔐 Authentication

Planned authentication methods include:

* No Authentication
* Bearer Token
* Basic Authentication
* API Key
* OAuth 2.0

---

## 📊 Response Viewer

Inspect API responses with:

* HTTP status code
* Response time
* Response size
* Response headers
* JSON response
* Raw response
* Formatted response

Example:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe"
  }
}
```

---

## 🕘 Request History

Automatically track previously executed requests.

Example:

```text
GET     /users          200    125ms
POST    /login          200    245ms
GET     /products       200    98ms
DELETE  /products/10    204    110ms
```

Users will be able to:

* Re-run requests
* Save requests
* Delete history
* Clear history

---

# 🧪 API Testing

NUVRO API Studio will provide API testing capabilities.

Example:

```text
GET /users
```

Tests:

```text
✓ Status code is 200
✓ Response time < 500ms
✓ Response contains "data"
✓ Response contains user ID
```

Future versions will support automated test suites and collection-based testing.

---

# ▶️ Collection Runner

Run multiple API requests sequentially.

Example:

```text
Authentication
      ↓
Login
      ↓
Create User
      ↓
Get User
      ↓
Update User
      ↓
Delete User
```

Example result:

```text
Collection: User API Tests

✓ Login              200
✓ Create User        201
✓ Get User           200
✓ Update User        200
✓ Delete User        204

5 passed
0 failed
```

---

# 📥 Import & Export

Planned support for importing and exporting API collections.

### Planned formats

* NUVRO API Studio format
* Postman Collection format
* JSON

Example:

```text
my-api.nuvro.json
```

This will make it easier to migrate existing API projects into NUVRO API Studio.

---

# 👥 Workspaces

Future versions will support workspaces for organizing projects and teams.

Example:

```text
NUVRO Workspace
│
├── E-Commerce API
├── Payment API
├── Authentication API
└── Internal API
```

---

# 🏗️ Architecture

NUVRO API Studio is designed as a monorepo so that the web application can be extended into desktop applications without rebuilding the entire product.

```text
                     NUVRO API STUDIO
                            │
              ┌─────────────┴─────────────┐
              │                           │
          Web Application            Desktop Application
              │                           │
          React + TS                   Tauri
              │                           │
              └─────────────┬─────────────┘
                            │
                     Shared Packages
                            │
              ┌─────────────┼─────────────┐
              │             │             │
          API Client       Core           UI
              │             │             │
              └─────────────┴─────────────┘
                            │
                       Node.js API
                            │
                         Prisma
                            │
                       PostgreSQL
```

---

# 📂 Project Structure

```text
nuvro-api-studio/
│
├── apps/
│   │
│   ├── web/
│   │   └── React web application
│   │
│   └── desktop/
│       └── Future Tauri desktop application
│
├── packages/
│   │
│   ├── core/
│   │   └── API Studio core functionality
│   │
│   ├── api-client/
│   │   └── HTTP request engine
│   │
│   ├── types/
│   │   └── Shared TypeScript types
│   │
│   ├── validation/
│   │   └── Shared validation schemas
│   │
│   ├── ui/
│   │   └── Shared React components
│   │
│   └── config/
│       └── Shared project configuration
│
├── backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── collections/
│   │   │   ├── environments/
│   │   │   ├── history/
│   │   │   ├── requests/
│   │   │   ├── testing/
│   │   │   ├── users/
│   │   │   └── workspaces/
│   │   ├── routes/
│   │   └── services/
│   │
│   └── tests/
│
├── database/
│   └── prisma/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── development/
│
├── tests/
│   ├── e2e/
│   └── integration/
│
├── scripts/
├── docker/
│
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Before running the project, make sure you have installed:

* Node.js 20+
* pnpm
* PostgreSQL
* Git
* Docker *(recommended)*

Check your versions:

```bash
node --version
pnpm --version
git --version
```

---

# 📥 Clone the Repository

```bash
git clone https://github.com/NUVRO/nuvro-api-studio.git
```

Enter the project:

```bash
cd nuvro-api-studio
```

> Replace the GitHub organization/repository URL if the repository is hosted under a different account.

---

# 📦 Install Dependencies

```bash
pnpm install
```

---

# ⚙️ Environment Configuration

Create your environment file:

```bash
cp .env.example .env
```

Configure the required values:

```env
NODE_ENV=development

DATABASE_URL="postgresql://postgres:password@localhost:5432/nuvro_api_studio"

API_PORT=4000

WEB_URL=http://localhost:5173
```

Never commit your real `.env` file.

---

# 🗄️ Database Setup

Generate the Prisma client:

```bash
pnpm prisma generate
```

Run migrations:

```bash
pnpm prisma migrate dev
```

Seed development data if available:

```bash
pnpm prisma db seed
```

---

# ▶️ Run the Development Environment

Start all applications:

```bash
pnpm dev
```

The development environment will start the required services.

Typical URLs:

```text
Web:
http://localhost:5173

Backend:
http://localhost:4000
```

---

# 🐳 Docker

Docker support is planned/provided for simplifying local development.

Build the containers:

```bash
docker compose build
```

Start services:

```bash
docker compose up -d
```

Check running containers:

```bash
docker compose ps
```

Stop services:

```bash
docker compose down
```

---

# 🧪 Testing

Run unit tests:

```bash
pnpm test
```

Run integration tests:

```bash
pnpm test:integration
```

Run end-to-end tests:

```bash
pnpm test:e2e
```

---

# 🔍 Code Quality

Run ESLint:

```bash
pnpm lint
```

Run TypeScript checks:

```bash
pnpm type-check
```

Format the project:

```bash
pnpm format
```

Build the project:

```bash
pnpm build
```

---

# 🔐 Security

NUVRO API Studio is designed to execute requests against external APIs.

Because of this, security is a major part of the architecture.

The project will consider protections against:

* SSRF
* Localhost access
* Private network access
* Internal IP access
* Cloud metadata endpoints
* Malicious redirects
* Excessive response sizes
* Long-running requests
* Request abuse
* Authentication token exposure

If you discover a security vulnerability, please do **not** create a public GitHub issue.

Use the project's security reporting process instead.

---

# 🗺️ Roadmap

## v0.1 — Foundation

* [x] Repository
* [ ] Monorepo configuration
* [ ] React application
* [ ] Node.js backend
* [ ] PostgreSQL
* [ ] Prisma
* [ ] Docker
* [ ] CI/CD

---

## v0.2 — API Client

* [ ] Request builder
* [ ] GET
* [ ] POST
* [ ] PUT
* [ ] PATCH
* [ ] DELETE
* [ ] Headers
* [ ] Query parameters
* [ ] JSON body
* [ ] Form data
* [ ] Response viewer

---

## v0.3 — Collections

* [ ] Workspaces
* [ ] Collections
* [ ] Folders
* [ ] Requests
* [ ] Rename
* [ ] Duplicate
* [ ] Delete
* [ ] Move requests

---

## v0.4 — Environments

* [ ] Environment management
* [ ] Variables
* [ ] Variable substitution
* [ ] Local environment
* [ ] Staging environment
* [ ] Production environment

---

## v0.5 — Authentication

* [ ] Bearer token
* [ ] Basic authentication
* [ ] API key
* [ ] OAuth 2.0

---

## v0.6 — History

* [ ] Request history
* [ ] Re-run request
* [ ] Save request
* [ ] Delete history
* [ ] Clear history

---

## v0.7 — API Testing

* [ ] Test builder
* [ ] Status assertions
* [ ] Response assertions
* [ ] Response-time assertions
* [ ] JSON assertions
* [ ] Test suites
* [ ] Collection runner

---

## v0.8 — Import & Export

* [ ] NUVRO collection format
* [ ] JSON export
* [ ] JSON import
* [ ] Postman import
* [ ] Postman export

---

## v0.9 — Collaboration

* [ ] User accounts
* [ ] Workspaces
* [ ] Workspace members
* [ ] Roles
* [ ] Permissions
* [ ] Team collections

---

## v1.0 — Production Release

* [ ] Production deployment
* [ ] Documentation
* [ ] Security audit
* [ ] Performance optimization
* [ ] Automated testing
* [ ] Public release

---

## Future — Desktop Applications

After the web application becomes stable:

### Windows

```text
NUVRO API Studio.exe
```

### macOS

```text
NUVRO API Studio.dmg
```

### Linux

```text
NUVRO API Studio.AppImage
```

Desktop applications will be built using **Tauri** and will reuse the project's shared core functionality.

---

# 🤝 Contributing

Contributions are welcome.

Before contributing:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Add or update tests.
5. Run linting and type checks.
6. Commit your changes.
7. Open a Pull Request.

Example:

```bash
git checkout -b feature/api-request-builder
```

Make your changes and commit:

```bash
git add .
git commit -m "feat: add API request builder"
```

Push your branch:

```bash
git push origin feature/api-request-builder
```

Then create a Pull Request.

---

# 🌿 Branch Strategy

The project uses the following branch strategy:

```text
main
  │
  └── develop
       │
       ├── feature/*
       ├── fix/*
       ├── refactor/*
       └── docs/*
```

### Main

Stable production-ready code.

### Develop

Integration branch for upcoming releases.

### Feature

New functionality.

Example:

```text
feature/collections
feature/api-testing
feature/environments
```

### Fix

Bug fixes.

Example:

```text
fix/request-timeout
fix/response-parser
```

---

# 📝 Commit Convention

NUVRO API Studio follows Conventional Commits.

Examples:

```text
feat: add API request builder
feat: add collection management

fix: handle request timeout
fix: resolve response parsing issue

refactor: improve request execution service

test: add collection service tests

docs: update installation guide

chore: update dependencies
```

---

# 📄 License

NUVRO API Studio is released under the **MIT License**.

See the [LICENSE](LICENSE) file for details.

---

# 👨‍💻 Author

**NUVRO**

Technology Partner & Software Development Company

Website: https://nuvrotech.in

---

# ⭐ Support the Project

If you find NUVRO API Studio useful:

* ⭐ Star the repository
* 🐛 Report bugs
* 💡 Suggest features
* 🔧 Submit Pull Requests
* 📢 Share the project with other developers

Every contribution helps improve the project.

---

# 📌 Project Goals

NUVRO API Studio is being developed with the following goals:

```text
Simple
    ↓
Powerful
    ↓
Developer Friendly
    ↓
Open Source
    ↓
Cross Platform
```

The long-term goal is to provide developers with a modern API workspace that can be used from the **browser, Windows, macOS, and Linux**.

---

## 🚀 NUVRO API Studio

**Build APIs. Test APIs. Understand APIs.**

Built with ❤️ by NUVRO.
