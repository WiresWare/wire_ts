import { Wire, WireWithDatabase } from 'wire.cores';
import { IWireDatabaseService, IWireMiddleware } from 'wire.cores/dist/interfaces';

import WebDatabaseService from '@/service/WebDatabaseService';

class StorageMiddleware extends WireWithDatabase implements IWireMiddleware {
  constructor() {
    super(Wire.find(WebDatabaseService) as IWireDatabaseService);
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
