import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './app.js';

describe('Express application server', () => {
  it('initializes correctly and passes health checks', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .expect('Content-Type', /json/)
      .expect(200);
      
    expect(res.body).toEqual({
      success: true,
      data: {
        status: 'ok',
      },
    });
  });

  it('generates a new request ID and returns X-Request-ID header', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .expect(200);

    expect(res.headers['x-request-id']).toBeDefined();
    // Validate request ID is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(res.headers['x-request-id'] as string)).toBe(true);
  });

  it('preserves an incoming valid request ID', async () => {
    const customId = '12345678-1234-1234-1234-1234567890ab';
    const res = await request(app)
      .get('/api/v1/health')
      .set('X-Request-ID', customId)
      .expect(200);

    expect(res.headers['x-request-id']).toBe(customId);
  });

  it('handles unknown routes with a standard 404 response', async () => {
    const res = await request(app)
      .get('/api/v1/unknown-endpoint-path')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: expect.stringContaining('does not exist'),
        requestId: expect.any(String),
      },
    });
  });

  it('handles malformed JSON payloads safely', async () => {
    const res = await request(app)
      .post('/api/v1/auth')
      .set('Content-Type', 'application/json')
      .send('{invalid-json-body')
      .expect(400);

    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'MALFORMED_JSON',
        message: 'Malformed JSON payload',
        requestId: expect.any(String),
      },
    });
  });

  it('returns CORS headers for configured origins', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173')
      .expect(200);

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});
