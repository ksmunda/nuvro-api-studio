# NUVRO API Studio — Database Architecture

This directory defines the database schema, migration procedures, seed datasets, and database client lifecycle wrappers.

---

## Workspace Isolation Strategy

To prevent cross-tenant data leaks (i.e. access tokens or requests belonging to Workspace A exposed to users from Workspace B), the repository/service layer implements **scoped queries**:

1. **Authorization Scoped Queries**: Repositories accept optional `workspaceId` parameters. Finding/updating models incorporates verification checks directly into the database selection filters:
   ```ts
   prisma.collection.findFirst({
     where: { id, workspaceId }
   });
   ```
2. **Access Control Verification**: Services fetch user memberships (`workspaceRepository.findMembership(workspaceId, userId)`) and validate client permissions (`VIEWER`, `MEMBER`, `ADMIN`, `OWNER`) before dispatching writes.

---

## Encryption Plan for Sensitive Data

The following fields contain highly sensitive information:
- `users.passwordHash`
- `refresh_tokens.token`
- `api_keys.keyHash`
- `variables.value` (where `isSecret = true`)

During Phase 4 (Authentication) and subsequent hardening phases:
- **Hashing**: Passwords are saved hashed with Argon2id / bcrypt. API keys are indexed via cryptographically hashed digests (`sha256`).
- **Encryption**: Secrets and third-party values (e.g., Bearer tokens, variables) will be encrypted at rest using AES-256-GCM.

---

## Developer Commands

Run database actions directly from the workspace root:

```bash
# Generate Prisma Client typings
pnpm db:generate

# Generate and apply new database migrations
pnpm db:migrate

# Populate development seed database
pnpm db:seed

# Inspect database using Prisma Studio GUI
pnpm db:studio

# Reset database schema completely
pnpm db:reset
```
