import FilterValues from '@/constants/FilterValues';
import { Wire } from 'cores.wire';
import ViewSignals from '@/constants/ViewSignals';

class RouteController {
  constructor() {
    window.onhashchange = this.checkFilterRouterChanged;
    this.checkFilterRouterChanged();
    console.log(`> RouteController -> initialized`);
  }
  checkFilterRouterChanged() {
    let filter = null;
    switch (window.location.hash) {
      case '#/':
        filter = FilterValues.ALL;
        break;
      case '#/active':
        filter = FilterValues.ACTIVE;
        break;
      case '#/completed':
        filter = FilterValues.COMPLETED;
        break;
    }
    console.log(`> RouteController -> onhashchange: filter = ${filter}`);
    if (filter != null) Wire.send(ViewSignals.FILTER, filter).then();
  }
}

export default RouteController;
