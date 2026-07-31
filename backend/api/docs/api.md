# NUVRO API Studio — Backend API Documentation

The NUVRO API Server is a modular monolith written in TypeScript using Express.js. All endpoints are versioned under `/api/v1`.

---

## Centralized Responses

Every response adheres to a strict JSON envelope structure.

### Successful Response Envelope
```json
{
  "success": true,
  "data": {}
}
```

### Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable description of what went wrong",
    "details": {},
    "requestId": "uuid-request-id"
  }
}
```

---

## Endpoints

### 1. Health Status
Returns the operational status of the API application server.

* **URL**: `/api/v1/health`
* **Method**: `GET`
* **Auth Required**: No

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

#### Headers
* `X-Request-ID`: Trace UUID for debugging.

---

## Future Feature Modules (v1 Placeholders)
* `/api/v1/auth` - Authentication & User Registration
* `/api/v1/workspaces` - Workspace creation & permissions
* `/api/v1/collections` - Request collections & folders
* `/api/v1/requests` - Arbitrary HTTP request builder & runner
* `/api/v1/environments` - Workspace environments & variables interpolation
* `/api/v1/history` - Request logging & auditing
