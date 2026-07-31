import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_HOST: z.string().default('localhost'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').default(
    process.env['NODE_ENV'] === 'test' ? 'postgresql://localhost:5432/test' : ''
  ),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').default('change_me_in_production_at_least_64_chars_long_random_secret'),
});

const getRawEnv = () => {
  return {
    NODE_ENV: process.env['NODE_ENV'],
    API_HOST: process.env['API_HOST'],
    API_PORT: process.env['API_PORT'],
    WEB_URL: process.env['WEB_URL'],
    DATABASE_URL: process.env['DATABASE_URL'],
    JWT_SECRET: process.env['JWT_SECRET'],
  };
};

const parsedEnv = envSchema.safeParse(getRawEnv());

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables Configuration:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
export type Env = z.infer<typeof envSchema>;
