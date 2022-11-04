import Wire, { WireMiddleware } from '@wire/core/dist/types/wire';
import { WireWithDatabase } from '@wire/core/dist/types/with';
import { WireDatabaseService } from '@wire/core/src/wire';
import WebDatabaseService from '@/service/WebDatabaseService';

class StorageMiddleware extends WireWithDatabase implements WireMiddleware {
  constructor() {
    super(Wire.find(WebDatabaseService) as WireDatabaseService);
  }
  onAdd(): Promise<void> {
    return Promise.resolve(undefined);
  }

  onData(key: string, prevValue?: any, nextValue?: any): Promise<void> {
    console.log(`> StorageMiddleware -> onData:`, { key, prevValue, nextValue });
    this.persist(key, nextValue);
    return Promise.resolve();
  }

  onRemove(): Promise<void> {
    return Promise.resolve(undefined);
  }

  onSend(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export default StorageMiddleware;
