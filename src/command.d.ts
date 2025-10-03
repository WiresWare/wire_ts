import { WireWithWireData } from './with';
import { IWireCommand } from './interfaces';
export declare class WireCommand<T> implements IWireCommand {
    execute(): Promise<T | null>;
}
export declare class WireCommandWithRequiredData<T = any> extends WireWithWireData<T> implements IWireCommand {
    get whenReady(): Promise<Map<string, T>>;
    private readonly _whenRequiredDataReady;
    constructor(requiredDataKeys?: string[]);
    execute(): Promise<any | null>;
}
