import { WireWithWireData } from './with';

export interface WireCommand<T> {
  execute(): Promise<T | null>;
}

export class WireCommandWithRequiredData<T> extends WireWithWireData implements WireCommand<T> {
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
  async execute(): Promise<T | null> {
    return null;
  }
}
