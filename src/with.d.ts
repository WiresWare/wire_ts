import { IWireData, IWireDatabaseService, IWireWithDatabase, IWireWithWireData } from './interfaces';
export declare class WireWithWhenReady {
    get whenReady(): Promise<any> | null | undefined;
    protected _whenReady: Promise<any> | null | undefined;
    constructor(whenReady?: Promise<any> | null | undefined);
}
export declare class WireWithDatabase extends WireWithWhenReady implements IWireWithDatabase {
    private readonly _databaseService;
    constructor(databaseService: IWireDatabaseService);
    get databaseService(): IWireDatabaseService;
    exist(key: string): Promise<boolean>;
    retrieve(key: string): Promise<any>;
    persist(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
}
export declare class WireWithWireData<T = any> implements IWireWithWireData<T> {
    getData(dataKey: string): IWireData<T>;
    has(dataKey: string): boolean;
    hasNot(dataKey: string): boolean;
    get(dataKey: string): Promise<T>;
    getMany(many: string[]): Promise<Map<string, T>>;
    update(dataKey: string, data: T, refresh?: boolean): Promise<void>;
    reset(dataKey: string): Promise<void>;
    remove(dataKey: string): Promise<void>;
}
