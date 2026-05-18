
import { describe, it, expect, beforeEach } from 'vitest';
import { BaseService } from '../BaseService';

// Concrete implementation for testing
class TestService extends BaseService<{ id: string; name: string }> {
  constructor() {
    super('test_storage_key', []);
  }
}

describe('BaseService', () => {
  let service: TestService;

  beforeEach(() => {
    localStorage.clear();
    service = new TestService();
  });

  it('should create an item', () => {
    const item = service.create({ name: 'Test Item' });
    expect(item.id).toBeDefined();
    expect(item.name).toBe('Test Item');
    expect(service.getAll()).toHaveLength(1);
  });

  it('should get item by id', () => {
    const item = service.create({ name: 'Test Item' });
    const found = service.getById(item.id);
    expect(found).toEqual(item);
  });

  it('should update an item', () => {
    const item = service.create({ name: 'Old Name' });
    const updated = service.update(item.id, { name: 'New Name' });
    expect(updated?.name).toBe('New Name');
    expect(service.getById(item.id)?.name).toBe('New Name');
  });

  it('should delete an item', () => {
    const item = service.create({ name: 'To be deleted' });
    const success = service.delete(item.id);
    expect(success).toBe(true);
    expect(service.getAll()).toHaveLength(0);
  });

  it('should notify subscribers on change', () => {
    let callCount = 0;
    service.subscribe(() => {
      callCount++;
    });

    service.create({ name: 'Trigger 1' });
    service.update('some-id', { name: 'No trigger if not found' }); // won't notify if failed
    
    const item = service.create({ name: 'Trigger 2' });
    service.update(item.id, { name: 'Trigger 3' });
    service.delete(item.id);

    // Initial load calls notify if something was in storage, but here it's empty
    // create (1) + create (2) + update (3) + delete (4)
    expect(callCount).toBe(4);
  });
});
