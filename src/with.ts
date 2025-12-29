import { IWireData, IWireDatabaseService, IWireWithDatabase, IWireWithWireData } from './interfaces';
import Wire from './wire';

export class WireWithWhenReady {
  get whenReady(): Promise<any> | null | undefined {
    return this._whenReady;
  }
  protected _whenReady: Promise<any> | null | undefined;
  constructor(whenReady?: Promise<any> | null | undefined) {
    this._whenReady = whenReady;
  }
}

export class WireWithDatabase extends WireWithWhenReady implements IWireWithDatabase {
  private readonly _databaseService: IWireDatabaseService;
  constructor(databaseService: IWireDatabaseService) {
    super();
    this._databaseService = databaseService;
  }
  get databaseService(): IWireDatabaseService {
    return this._databaseService;
  }
  async exist(key: string): Promise<boolean> {
    return await this._databaseService.exist(key);
  }
  async retrieve(key: string): Promise<any> {
    return this._databaseService.retrieve(key);
  }
  // Stringify value before sends to database
  async persist(key: string, value: any): Promise<void> {
    await this._databaseService.save(key, JSON.stringify(value));
  }
  async delete(key: string): Promise<void> {
    if (await this.exist(key)) {
      await this._databaseService.delete(key);
    }
  }
}

export class WireWithWireData<T = any> implements IWireWithWireData<T> {
  getData(dataKey: string): IWireData<T> {
    return Wire.data<T>(dataKey);
  }

  has(dataKey: string): boolean {
    return Wire.data<T>(dataKey).isSet;
  }

  hasNot(dataKey: string): boolean {
    return !this.has(dataKey);
  }

  async get(dataKey: string): Promise<T> {
    return new Promise((resolve, rejects) => {
      if (this.has(dataKey)) {
        resolve(this.getData(dataKey).value as T);
      } else {
        rejects(`Error: missing data on key - ${dataKey}`);
      }
    });
  }

  async getMany(many: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();
    for await (const item of many) {
      result.set(item, await this.get(item));
    }
    return result;
  }

  async update(dataKey: string, data: T, refresh = true): Promise<void> {
    if (data != null) Wire.data<T>(dataKey, data);
    else if (refresh) await this.getData(dataKey).refresh(data);
  }

  async reset(dataKey: string): Promise<void> {
    if (this.has(dataKey)) await this.getData(dataKey).reset();
  }

  async remove(dataKey: string): Promise<void> {
    if (this.has(dataKey)) await this.getData(dataKey).remove(false);
  }
}
