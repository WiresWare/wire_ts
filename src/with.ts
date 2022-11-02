import { WireData } from './data';
import Wire, { WireDatabaseService } from './wire';

export interface WireWithWhenReady {
  whenReady: Promise<boolean>;
}

export class WireWithDatabase {
  private readonly databaseService: WireDatabaseService;
  constructor(databaseService: WireDatabaseService) {
    this.databaseService = databaseService;
  }
  exist(key: string) {
    return this.databaseService.exist(key);
  }
  async retrieve(key: string): Promise<any> {
    return this.databaseService.retrieve(key);
  }
  // Stringify value before sends to database
  persist(key: string, value: any): void {
    this.databaseService.save(key, JSON.stringify(value));
  }
  delete(key: string): void {
    if (this.exist(key)) this.databaseService.delete(key);
  }
}
export class WireWithWireData {
  getData<T>(dataKey: string): WireData<T> {
    return Wire.data<T>(dataKey);
  }
  has(dataKey: string): boolean {
    return Wire.data(dataKey).isSet;
  }
  hasNot(dataKey: string): boolean {
    return !this.has(dataKey);
  }
  async get<T>(dataKey: string): Promise<T> {
    return new Promise((resolve, rejects) => {
      if (this.has(dataKey)) {
        resolve(this.getData(dataKey).value as T);
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
    if (this.has(dataKey)) await this.getData(dataKey).remove();
  }
}
