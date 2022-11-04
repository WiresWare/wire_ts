import { WireDatabaseService } from '@wire/core/src/wire';

class WebDatabaseService implements WireDatabaseService {
  delete(key: string): void {
    console.log(`> StaticDatabaseService -> delete: ${key}`);
    window.localStorage.remove(key);
  }

  exist(key: string): boolean {
    const result = !!window.localStorage.containsKey(key);
    console.log(`> WebDatabaseService -> exist: ${key} = ${result}`);
    return result;
  }

  init(key: string): Promise<boolean> {
    console.log(`> StaticDatabaseService -> init: ${key}`);
    return Promise.resolve(true);
  }

  retrieve(key: string): Promise<any> {
    const value = window.localStorage[key];
    console.log(`> WebDatabaseService -> retrieve: ${key}`);
    return Promise.resolve(value != null ? JSON.parse(value) : null);
  }

  save(key: string, data: any): void {
    console.log('> WebDatabaseService -> save: $key = $data');
    window.localStorage[key] = JSON.stringify(data);
  }
}

export default WebDatabaseService;
