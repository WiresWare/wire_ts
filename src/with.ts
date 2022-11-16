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

export class WireWithWireData implements IWireWithWireData {
  getData(dataKey: string): IWireData {
    return Wire.data(dataKey);
  }
  has(dataKey: string): boolean {
    return Wire.data(dataKey).isSet;
  }
  hasNot(dataKey: string): boolean {
    return !this.has(dataKey);
  }
  async get(dataKey: string): Promise<any> {
    return new Promise((resolve, rejects) => {
      if (this.has(dataKey)) {
        resolve(this.getData(dataKey).value);
      } else {
        rejects(`Error: missing data on key - ${dataKey}`);
      }
    });
  }
  async getMany(many: string[]): Promise<Map<string, any>> {
    const result = new Map();
    for await (const item of many) {
      result.set(item, await this.get(item));
    }
    return result;
  }
  async update(dataKey: string, data: any, refresh = true): Promise<void> {
    if (data != null) Wire.data(dataKey, data);
    else if (refresh) await this.getData(dataKey).refresh();
  }
  async reset(dataKey: string): Promise<void> {
    if (this.has(dataKey)) await this.getData(dataKey).reset();
  }
  async remove(dataKey: string): Promise<void> {
    if (this.has(dataKey)) await this.getData(dataKey).remove(false);
  }
}
