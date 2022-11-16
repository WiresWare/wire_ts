import { Wire, WireWithDatabase } from 'cores.wire';
import { IWireDatabaseService, IWireMiddleware } from 'cores.wire/dist/interfaces';

import WebDatabaseService from '@/service/WebDatabaseService';
import DataKeys from '@/consts/DataKeys';
import TodoVO from '@/model/vos/TodoVO';
import FilterValues from '@/consts/FilterValues';

class TodoStorageMiddleware extends WireWithDatabase implements IWireMiddleware {
  constructor() {
    super(Wire.find(WebDatabaseService) as IWireDatabaseService);
    this._whenReady = new Promise((resolve) => {
      this.databaseService
        .init()
        .then(async () => {
          const isListOfIdsExist = await this.exist(DataKeys.LIST_OF_IDS);
          console.log('> TodoStorageMiddleware -> init: then', isListOfIdsExist);
          const todoIdsList = [];
          if (isListOfIdsExist) {
            const todoIdsListRaw = await this.retrieve(DataKeys.LIST_OF_IDS);
            for await (const todoId of JSON.parse(todoIdsListRaw)) {
              const rawString = await this.retrieve(todoId);
              const todo = TodoVO.fromJSON(JSON.parse(rawString));
              Wire.data(todoId, todo);
              todoIdsList.push(todoId);
            }
          }
          Wire.data(DataKeys.LIST_OF_IDS, todoIdsList);
        })
        .then(async () => {
          if (await this.exist(DataKeys.NOT_COMPLETED_COUNT)) {
            const value = parseInt(await this.retrieve(DataKeys.NOT_COMPLETED_COUNT));
            Wire.data(DataKeys.NOT_COMPLETED_COUNT, value);
          } else Wire.data(DataKeys.NOT_COMPLETED_COUNT, 0);
        })
        .then(async () => {
          if (await this.exist(DataKeys.FILTER)) {
            const value = parseInt(await this.retrieve(DataKeys.FILTER));
            Wire.data(DataKeys.FILTER, value);
          } else Wire.data(DataKeys.FILTER, FilterValues.ALL);
        })
        .then(async () => {
          if (await this.exist(DataKeys.COMPLETE_ALL)) {
            const value = (await this.retrieve(DataKeys.COMPLETE_ALL)) === 'true';
            Wire.data(DataKeys.COMPLETE_ALL, value);
          } else Wire.data(DataKeys.COMPLETE_ALL, false);
        })
        .finally(() => resolve(this));
    });
  }

  onAdd(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async onData(key: string, prevValue?: any, nextValue?: any): Promise<void> {
    console.log(`> StorageMiddleware -> onData:`, { key, prevValue, nextValue });
    await this.persist(key, nextValue);
    return Promise.resolve();
  }

  onRemove(): Promise<void> {
    return Promise.resolve(undefined);
  }

  onSend(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export default TodoStorageMiddleware;
