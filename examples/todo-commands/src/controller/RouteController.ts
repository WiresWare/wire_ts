import FilterValues from '@/consts/FilterValues';
import { Wire } from 'cores.wire';
import ViewSignals from '@/consts/ViewSignals';

class RouteController {
  constructor() {
    window.onhashchange = this.checkFilterRouterChanged;
    this.checkFilterRouterChanged();
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
