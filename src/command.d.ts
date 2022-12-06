import { WireWithWireData } from './with';
import { IWireCommand } from './interfaces';
export declare class WireCommand<T> implements IWireCommand {
    execute(): Promise<T | null>;
}
export declare class WireCommandWithRequiredData extends WireWithWireData implements IWireCommand {
    get whenReady(): Promise<Map<string, any>>;
    private readonly _whenRequiredDataReady;
    constructor(requiredDataKeys?: any[]);
    execute(): Promise<any | null>;
}
