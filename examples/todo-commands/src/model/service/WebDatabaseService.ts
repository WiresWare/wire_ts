import { WireDatabaseService } from 'cores.wire';

class WebDatabaseService implements WireDatabaseService {
  async delete(key: string): Promise<void> {
    console.log(`> WebDatabaseService -> delete: ${key}`);
    window.localStorage.removeItem(key);
  }

  async exist(key: string): Promise<boolean> {
    const result = !!window.localStorage[key];
    // console.log(`> WebDatabaseService -> exist: ${key} = ${result}`);
    return Promise.resolve(result);
  }

  async init(key: string): Promise<boolean> {
    // console.log(`> WebDatabaseService -> init: key = ${key}`);
    return Promise.resolve(!!key || true);
  }

  async retrieve(key: string): Promise<any> {
    const value = window.localStorage[key];
    // console.log(`> WebDatabaseService -> retrieve: ${key}`);
    return Promise.resolve(value != null ? JSON.parse(value) : null);
  }

  async save(key: string, data: any): Promise<void> {
    // console.log('> WebDatabaseService -> save: $key = $data');
    window.localStorage[key] = JSON.stringify(data);
  }
}

export default WebDatabaseService;
