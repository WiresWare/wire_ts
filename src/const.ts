export const ERROR__WIRE_ALREADY_REGISTERED = `WR:1001 - Wire already registered, wireId: `;

export const ERROR__MIDDLEWARE_EXISTS = `WR:2001 - Middleware already registered, middleware: `;

export const ERROR__LISTENER_IS_NULL = `WR:3000 - Listener is null`;

export const ERROR__DATA_IS_LOCKED = `WR:3001 - WireData value change not allowed - data modification locked with token`;
export const ERROR__DATA_ALREADY_LOCKED = `WR:3002 - WireData already locked with token - call unlock method first with proper token`;
export const ERROR__DATA_CANNOT_BE_OPEN = `WR:3002 - WireData tokens do not match - to unlock data for modification use proper token`;
export const ERROR__DATA_IS_GETTER = `WR:3003 - WireData is a getter - it cannot be modified only accessed`;
export const ERROR__SUBSCRIBE_TO_DATA_GETTER =
  'WR:3005 - WireData is a getter - you can not subscribe/unsubscribe to getter, its locked hence setter is prohibited';

export const ERROR__VALUE_IS_NOT_ALLOWED_TOGETHER_WITH_GETTER = `WR:3004 - WireData is a getter - setting value together with getter is not allowed`;

export const ERROR__CANT_PUT_ALREADY_EXISTING_INSTANCE = `WR:4001 - Cant put already existing instance (unlock first)`;
export const ERROR__CANT_FIND_INSTANCE_NULL = `WR:4002 - Cant find instance its not set`;
