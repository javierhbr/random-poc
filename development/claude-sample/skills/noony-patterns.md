# Noony Common Patterns

Frequently used patterns for pagination, filtering, permissions, and more.

## Pagination

```typescript
// Controller
listItems = async (context: Context<unknown>) => {
  const { familyId } = context.req.params;
  const limit = Math.min(parseInt(context.req.query.limit || '50'), 100);
  const offset = parseInt(context.req.query.offset || '0');

  const [items, total] = await Promise.all([
    this.itemService.list(familyId, { limit, offset }),
    this.itemService.count(familyId),
  ]);

  return {
    items,
    pagination: { total, limit, offset, hasMore: offset + items.length < total },
  };
};

// Repository
async findByFamily(familyId: string, options: { limit: number; offset: number }) {
  await ensureConnected();
  return await ItemModel.find({ familyId })
    .sort({ createdAt: -1 })
    .limit(options.limit)
    .skip(options.offset)
    .lean();
}
```

## Query Filtering

```typescript
listItems = async (context: Context<unknown>) => {
  const { familyId } = context.req.params;
  const filters = {
    childId: context.req.query.childId as string | undefined,
    delivered: context.req.query.delivered === 'true',
    minPrice: context.req.query.minPrice
      ? parseFloat(context.req.query.minPrice as string)
      : undefined,
  };

  return await this.itemService.list(familyId, filters);
};

// Repository
async findByFamily(familyId: string, filters: ItemFilters) {
  await ensureConnected();

  const query: any = { familyId };
  if (filters.childId) query.childId = filters.childId;
  if (filters.delivered !== undefined) query.delivered = filters.delivered;
  if (filters.minPrice) query.price = { $gte: filters.minPrice };

  return await ItemModel.find(query).lean();
}
```

## Soft Delete

```typescript
// Schema
const ItemSchema = new Schema({
  _id: String,
  name: String,
  deletedAt: { type: Date, default: null },
});

ItemSchema.index({ familyId: 1, deletedAt: 1 });

// Repository - Only return non-deleted
async findByFamily(familyId: string) {
  await ensureConnected();
  return await ItemModel.find({ familyId, deletedAt: null }).lean();
}

// Soft delete
async softDelete(familyId: string, id: string) {
  await ensureConnected();
  return await ItemModel.findOneAndUpdate(
    { _id: id, familyId },
    { deletedAt: new Date() },
    { new: true }
  ).lean();
}
```

## Permission Checking

### Option 1: Guard Middleware (Single Permission)

```typescript
// Handler
export const createItemHandler = new Handler<any>()
  .use(new ErrorHandlerMiddleware())
  .use(new ResponseWrapperMiddleware(201))
  .use(new AuthenticationMiddleware(tokenValidator))
  .use(new PermissionsGuard(Permissions.MANAGE_ITEMS)) // ← Check here
  .use(new BodyParserMiddleware())
  .use(new BodyValidationMiddleware(schema))
  .handle(controller.createItem as any);
```

### Option 2: Service Layer (Conditional Logic)

```typescript
// Handler - Just resolve membership
.use(new PermissionsGuard()) // No specific permission

// Service - Check based on operation
async update(familyId: string, id: string, membership: Membership, updates: any) {
  if (updates.delivered) {
    // Delivery requires DELIVER_ITEMS permission
    checkPermission(membership, Permissions.DELIVER_ITEMS);
  } else {
    // Other updates require MANAGE_ITEMS
    checkPermission(membership, Permissions.MANAGE_ITEMS);
  }

  return await this.itemRepo.update(familyId, id, updates);
}

function checkPermission(membership: Membership, permission: string) {
  if (membership.role === 'owner') return; // Owners have all permissions
  if (membership.permissions.includes('*')) return; // Wildcard
  if (membership.permissions.includes(permission)) return;

  throw new Error(`Permission denied: ${permission}`);
}
```

## Timezone Handling

```typescript
createItem = async (context: Context<CreateItemRequest>) => {
  const { familyId } = context.req.params;
  const data = context.req.validatedBody!;

  // Parallel fetch
  const [item, timezone] = await Promise.all([
    this.itemService.create(familyId, userId, data),
    this.familyService.getTimezone(familyId),
  ]);

  // Client uses timezone to display dates correctly
  return { ...item, _meta: { timezone } };
};
```

## Error Handling

```typescript
// Custom business errors
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

// Service
async getById(familyId: string, id: string) {
  const item = await this.itemRepo.findById(familyId, id);
  if (!item) {
    throw new NotFoundError(`Item not found: ${id}`);
  }
  return item;
}

// ErrorHandlerMiddleware automatically maps these to correct HTTP status
```

## Batch Operations

```typescript
// Service
async createBatch(familyId: string, userId: string, items: CreateItemRequest[]) {
  const promises = items.map(item =>
    this.itemRepo.create(familyId, { ...item, createdBy: userId })
  );

  return await Promise.all(promises);
}

// Repository - Use bulkWrite for efficiency
async createBatch(familyId: string, items: any[]) {
  await ensureConnected();

  const operations = items.map(item => ({
    insertOne: {
      document: {
        _id: ulid(),
        familyId,
        ...item,
        createdAt: new Date(),
      },
    },
  }));

  const result = await ItemModel.bulkWrite(operations);
  return result;
}
```

## Logging Pattern

```typescript
// Component logger
const serviceLogger = logger.child({ component: 'item_service' });

async create(familyId: string, userId: string, data: CreateItemRequest) {
  serviceLogger.info('Creating item', { familyId, userId, itemName: data.name });

  try {
    const item = await this.itemRepo.create(familyId, { ...data, createdBy: userId });
    serviceLogger.info('Item created', { itemId: item._id });
    return item;
  } catch (error) {
    serviceLogger.error('Failed to create item', { error, familyId });
    throw error;
  }
}
```
