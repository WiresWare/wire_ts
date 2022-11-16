import { WireWithWireData } from './with';
import { IWireCommand } from './interfaces';

export class WireCommand<T> implements IWireCommand {
  async execute(): Promise<T | null> {
    return Promise.resolve(null);
  }
}

export class WireCommandWithRequiredData extends WireWithWireData implements IWireCommand {
  get whenReady(): Promise<Map<string, any>> {
    return this._whenRequiredDataReady;
  }
  private readonly _whenRequiredDataReady: Promise<Map<string, any>>;
  constructor(requiredDataKeys: any[] = []) {
    super();
    this._whenRequiredDataReady = new Promise((resolve) => {
      this.getMany(requiredDataKeys).then(resolve);
    });
  }
  async execute(): Promise<any | null> {
    return null;
  }
}
