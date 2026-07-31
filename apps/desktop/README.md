# NUVRO API Studio — Desktop

> **Status**: Not yet implemented. Planned for Phase 8.

This directory will contain the Tauri shell for native desktop applications
(Windows, macOS, Linux).

## Architecture

The desktop app will:
- Load the same React frontend from `packages/ui` and `packages/core`
- Replace the HTTP proxy transport with `@tauri-apps/api/http` via a `TauriTransport`
- Use a local SQLite database (Prisma with SQLite) instead of remote PostgreSQL
- Add native capabilities: system tray, native menus, file system access, OS keychain

## Why not yet

The web application (Phases 1–7) must be complete before desktop work begins.
The `packages/core` and `packages/api-client` architecture ensures zero UI code
duplication when desktop support is added.
