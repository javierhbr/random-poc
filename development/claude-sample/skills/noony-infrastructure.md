# Noony Infrastructure Setup

Essential infrastructure code for MongoDB, Firebase, and deployment.

## MongoDB Connection

```typescript
// src/config/db.ts
import mongoose from 'mongoose';
import { logger } from './logger';

const dbLogger = logger.child({ component: 'MongoDB' });

export const ensureConnected = async (): Promise<void> => {
  const currentState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

  if (currentState === 1) return; // Connected

  if (currentState === 2) {
    // Connecting - wait
    await new Promise((resolve, reject) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', reject);
      setTimeout(() => reject(new Error('Timeout')), 5000);
    });
    return;
  }

  await connectDB(); // Not connected - connect now
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');

  await mongoose.connect(uri, {
    // Serverless-optimized timeouts
    serverSelectionTimeoutMS: 2000, // 2s - prevents 504 Gateway Timeout
    connectTimeoutMS: 2000, // 2s - fail fast
    socketTimeoutMS: 30000, // 30s - for long queries

    // Connection pooling
    maxPoolSize: 10, // Max connections
    minPoolSize: 0, // 0 for serverless (no idle connections)
    maxIdleTimeMS: 10000, // Close idle after 10s

    retryWrites: true,
    serverApi: { version: '1' },
  });

  dbLogger.info('MongoDB connected');
};
```

## Firebase Admin SDK

```typescript
// src/config/firebase.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export const auth = getAuth();
export const firestore = getFirestore();
```

## Firebase Token Validator

```typescript
// src/auth/firebase-token-validator.ts
import { auth } from 'firebase-admin';
import { CustomTokenVerificationPort } from '@noony-serverless/core';

export interface FirebaseUser {
  uid: string;
  email?: string;
  email_verified?: boolean;
}

export class FirebaseTokenValidator implements CustomTokenVerificationPort<FirebaseUser> {
  private cache = new Map<string, { result: FirebaseUser; expiry: number }>();

  constructor(
    private firebaseAuth: auth.Auth,
    private config: {
      requireEmailVerified: boolean;
      enableCaching: boolean;
      cacheTTL: number;
    }
  ) {}

  async verifyToken(token: string): Promise<FirebaseUser> {
    // 1. Check cache (5-min TTL)
    if (this.config.enableCaching) {
      const cached = this.cache.get(token);
      if (cached && cached.expiry > Date.now()) {
        return cached.result;
      }
    }

    // 2. Verify token (5s timeout)
    const decodedToken = await Promise.race([
      this.firebaseAuth.verifyIdToken(token, true),
      this.timeout(5000),
    ]);

    // 3. Fetch user record
    const userRecord = await Promise.race([
      this.firebaseAuth.getUser(decodedToken.uid),
      this.timeout(5000),
    ]);

    // 4. Check email verification
    if (this.config.requireEmailVerified && !userRecord.emailVerified) {
      throw new Error('Email not verified');
    }

    // 5. Map to user object
    const user: FirebaseUser = {
      uid: userRecord.uid,
      email: userRecord.email,
      email_verified: userRecord.emailVerified,
    };

    // 6. Cache result
    if (this.config.enableCaching) {
      this.cache.set(token, {
        result: user,
        expiry: Date.now() + this.config.cacheTTL,
      });

      // Clean expired entries (prevent memory leak)
      if (this.cache.size > 1000) {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
          if (now > value.expiry) this.cache.delete(key);
        }
      }
    }

    return user;
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Token verification timeout')), ms)
    );
  }
}
```

## Structured Logging

```typescript
// src/config/logger.ts
import pino from 'pino';
import type { LoggerOptions } from 'pino';

export function getLoggerConfig(name?: string): LoggerOptions | boolean {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  if (isTest) return false;

  return {
    name: name || 'api',
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    messageKey: 'message',

    formatters: {
      level: (label) => ({ severity: label.toUpperCase() }),
    },

    // Pretty print in development
    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  };
}

export const logger = pino(getLoggerConfig());
```

## Environment Validation

```typescript
// src/config/environmentValidation.ts
import { logger } from './logger';

const requiredEnvVars = [
  'MONGODB_URI',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

export function validateEnvVars(): void {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }

  logger.info('Environment variables validated');
}
```

## Cloud Functions Entry Point

```typescript
// src/functions.ts
import { http } from '@google-cloud/functions-framework';
import Fastify from 'fastify';
import { createFastifyHandler, extractAndStoreRequestBody } from '@noony-serverless/core';
import { connectDB } from './config/db';
import { validateEnvVars } from './config/environmentValidation';
import { getLoggerConfig } from './config/logger';

const server = Fastify({
  logger: getLoggerConfig('cloud-function'),
  requestIdHeader: 'x-request-id',
});

let isInitialized = false;

async function initializeDependencies(): Promise<void> {
  if (isInitialized) return; // Warm start
  validateEnvVars();
  await connectDB();
  isInitialized = true;
}

const adapt = (handler: any, name: string) =>
  createFastifyHandler(handler, name, initializeDependencies);

// Register routes
server.get('/ping', adapt(pingHandler, 'ping'));
server.post('/api/items', adapt(createItemHandler, 'createItem'));
// ... more routes

await server.ready();

// Export SINGLE Cloud Function
http('api', extractAndStoreRequestBody(server));
```

## Development Server

```typescript
// src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createFastifyHandler } from '@noony-serverless/core';
import { connectDB } from './config/db';
import { getLoggerConfig } from './config/logger';

const server = Fastify({
  logger: getLoggerConfig('dev-server'),
  requestIdHeader: 'x-request-id',
});

// CORS
server.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || true,
  credentials: true,
});

// Connect DB
connectDB();

const adapt = (handler: any, name: string) => createFastifyHandler(handler, name);

// Register routes
server.get('/ping', adapt(pingHandler, 'ping'));
// ... more routes

// Start server
const PORT = parseInt(process.env.PORT || '8080', 10);
server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
```

## Deployment Script

```bash
#!/bin/bash
# deploy/deploy.sh

set -e

PROJECT_ID="my-project"
REGION="us-central1"
FUNCTION_NAME="api"

echo "🚀 Deploying to Google Cloud Functions..."

gcloud functions deploy $FUNCTION_NAME \
  --gen2 \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=. \
  --entry-point=api \
  --trigger-http \
  --allow-unauthenticated \
  --timeout=60s \
  --memory=512MB \
  --max-instances=100 \
  --set-env-vars="NODE_ENV=production"

echo "✅ Deployment complete!"
```

## Environment Variables

```bash
# .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
FIREBASE_PROJECT_ID=my-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@my-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
REQUIRE_EMAIL_VERIFIED=false
CORS_ORIGIN=http://localhost:3000,https://app.example.com
LOG_LEVEL=debug
NODE_ENV=development
```
