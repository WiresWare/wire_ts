import { Wire, WireWithDatabase } from 'cores.wire';
import { IWireDatabaseService, IWireMiddleware } from 'cores.wire/dist/interfaces';

import WebDatabaseService from '@/model/service/WebDatabaseService';
import DataKeys from '@/constants/DataKeys';
import TodoVO from '@/model/data/vos/TodoVO';
import FilterValues from '@/constants/FilterValues';

class StorageMiddleware extends WireWithDatabase implements IWireMiddleware {
  constructor() {
    super(Wire.find(WebDatabaseService) as IWireDatabaseService);
    this._whenReady = new Promise((resolve) => {
      this.databaseService
        .init()
        .then(async () => {
          const isListOfIdsExist = await this.exist(DataKeys.LIST_OF_IDS);
          console.log('> StorageMiddleware -> init: then', { isListOfIdsExist });
          const listOfTodoIds = [];
          let notCompletedCount = 0;
          if (isListOfIdsExist) {
            const todoIdsListRaw = await this.retrieve(DataKeys.LIST_OF_IDS);
            for await (const todoId of JSON.parse(todoIdsListRaw)) {
              const rawString = await this.retrieve(todoId);
              const todo = TodoVO.fromJSON(JSON.parse(rawString));
              if (!todo.completed) notCompletedCount += 1;
              Wire.data(todoId, todo);
              listOfTodoIds.push(todoId);
            }
          }
          Wire.data(DataKeys.LIST_OF_IDS, listOfTodoIds);
          Wire.data(DataKeys.NOT_COMPLETED_COUNT, notCompletedCount);
        })
        .then(async () => {
          const todoIdsListVisibleRaw = JSON.parse(await this.retrieve(DataKeys.LIST_OF_IDS_VISIBLE)) || [];
          console.log('> StorageMiddleware -> init: then', { todoIdsListVisibleRaw });
          Wire.data(DataKeys.LIST_OF_IDS_VISIBLE, todoIdsListVisibleRaw);
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
    if (nextValue == null) await this.delete(key);
    else await this.persist(key, nextValue);
  }

  onRemove(): Promise<void> {
    return Promise.resolve(undefined);
  }

  onSend(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export default StorageMiddleware;
