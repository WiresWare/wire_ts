///
/// Created by Vladimir (Cores) Minkin on 31/10/22.
/// Github: https://github.com/vladimircores
/// License: APACHE LICENSE, VERSION 2.0
///
export class WireSendResults {
  constructor(dataList: Array<any>, noSubscribers = false) {
    this._dataList = dataList;
    this._noSubscribers = noSubscribers;
  }

  private readonly _dataList: Array<any>;
  private readonly _noSubscribers: boolean;

  get dataList() {
    return this._dataList;
  }
  get signalHasNoSubscribers() {
    return this._noSubscribers;
  }
}
