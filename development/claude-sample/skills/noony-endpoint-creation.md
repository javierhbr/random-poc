# Noony Endpoint Creation - Step by Step

Complete code templates for creating a new CRUD endpoint.

## Step 1: Zod Schema

```typescript
// src/models/item.models.ts
import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  childId: z.string().length(26), // ULID
  price: z.number().positive().optional(),
});

export const updateItemSchema = createItemSchema.partial();

export type CreateItemRequest = z.infer<typeof createItemSchema>;
export type UpdateItemRequest = z.infer<typeof updateItemSchema>;
```

## Step 2: Repository

```typescript
// src/repositories/item.repository.ts
import { ulid } from 'ulid';
import { ensureConnected } from '../config/db';
import { ItemModel } from './schemas/item.schema';

export class ItemRepository {
  async create(familyId: string, data: any) {
    await ensureConnected(); // ← CRITICAL

    const item = new ItemModel({
      _id: ulid(),
      familyId,
      ...data,
      createdAt: new Date(),
    });

    await item.save();
    return item.toObject();
  }

  async findByFamily(familyId: string) {
    await ensureConnected();
    return await ItemModel.find({ familyId }).lean();
  }

  async findById(familyId: string, id: string) {
    await ensureConnected();
    return await ItemModel.findOne({ _id: id, familyId }).lean();
  }

  async update(familyId: string, id: string, updates: any) {
    await ensureConnected();
    return await ItemModel.findOneAndUpdate(
      { _id: id, familyId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
  }

  async delete(familyId: string, id: string) {
    await ensureConnected();
    return await ItemModel.deleteOne({ _id: id, familyId });
  }
}
```

## Step 3: Service

```typescript
// src/services/item.service.ts
import { ItemRepository } from '../repositories/item.repository';

export class ItemService {
  constructor(private itemRepo: ItemRepository) {}

  async create(familyId: string, userId: string, data: CreateItemRequest) {
    // Business logic here
    return await this.itemRepo.create(familyId, { ...data, createdBy: userId });
  }

  async list(familyId: string) {
    return await this.itemRepo.findByFamily(familyId);
  }

  async getById(familyId: string, id: string) {
    const item = await this.itemRepo.findById(familyId, id);
    if (!item) throw new Error('Item not found');
    return item;
  }

  async update(familyId: string, id: string, data: UpdateItemRequest) {
    return await this.itemRepo.update(familyId, id, data);
  }

  async delete(familyId: string, id: string) {
    await this.itemRepo.delete(familyId, id);
  }
}
```

## Step 4: Controller

```typescript
// src/controllers/item.controller.ts
import { Context } from '@noony-serverless/core';
import { AuthenticatedContext } from '../middlewares/auth.middleware';

export class ItemController {
  constructor(private itemService: ItemService) {}

  createItem = async (context: Context<CreateItemRequest>) => {
    const authContext = context as unknown as AuthenticatedContext;
    const { familyId } = context.req.params;
    const data = context.req.validatedBody!;

    // ✅ Return data - Handler captures it
    return await this.itemService.create(familyId, authContext.user!.uid, data);
  };

  listItems = async (context: Context<unknown>) => {
    const { familyId } = context.req.params;
    return await this.itemService.list(familyId);
  };

  getItem = async (context: Context<unknown>) => {
    const { familyId, id } = context.req.params;
    return await this.itemService.getById(familyId, id);
  };

  updateItem = async (context: Context<UpdateItemRequest>) => {
    const { familyId, id } = context.req.params;
    const data = context.req.validatedBody!;
    return await this.itemService.update(familyId, id, data);
  };

  deleteItem = async (context: Context<unknown>) => {
    const { familyId, id } = context.req.params;
    await this.itemService.delete(familyId, id);
    return { message: 'Item deleted' };
  };
}
```

## Step 5: Handler & Routes

```typescript
// src/handlers/item.handlers.ts
import { Handler, ErrorHandlerMiddleware, ResponseWrapperMiddleware } from '@noony-serverless/core';
import { createItemSchema } from '../models/item.models';

// DI Wiring
const itemRepo = new ItemRepository();
const itemService = new ItemService(itemRepo);
const itemController = new ItemController(itemService);

const tokenValidator = new FirebaseTokenValidator(auth, {
  requireEmailVerified: process.env.REQUIRE_EMAIL_VERIFIED === 'true',
  enableCaching: true,
  cacheTTL: 5 * 60 * 1000,
});

export const createItemHandler = new Handler<any>()
  .use(new ErrorHandlerMiddleware())
  .use(new ResponseWrapperMiddleware(201))
  .use(new AuthenticationMiddleware(tokenValidator))
  .use(new PermissionsGuard(Permissions.MANAGE_ITEMS))
  .use(new BodyParserMiddleware())
  .use(new BodyValidationMiddleware(createItemSchema))
  .use(createSignalMiddleware({ event: 'item' }))
  .handle(itemController.createItem as any);

// Register in src/functions.ts & src/server.ts
server.post('/api/families/:familyId/items', adapt(createItemHandler, 'createItem'));
```

## MongoDB Schema Template

```typescript
// src/repositories/schemas/item.schema.ts
import { Schema, model } from 'mongoose';

export interface ItemDocument {
  _id: string;
  familyId: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
}

const ItemSchema = new Schema<ItemDocument>({
  _id: { type: String, required: true },
  familyId: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, required: true },
  createdBy: { type: String, required: true },
  updatedAt: { type: Date },
});

// Indexes
ItemSchema.index({ familyId: 1, createdAt: -1 });

export const ItemModel = model<ItemDocument>('Item', ItemSchema);
```
