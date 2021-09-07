export const ERROR__WIRE_ALREADY_REGISTERED:String =
  'WR:1001 - Wire already registered, wireId: '

export const ERROR__MIDDLEWARE_EXISTS:String =
  'WR:2001 - Middleware already registered, middleware: '

export const ERROR__LISTENER_IS_NULL:String =
  'WR:3000 - Listener is null'
export const ERROR__DATA_IS_LOCKED:String =
  'WR:3001 - WireData value change not allowed - data modification locked with token'
export const ERROR__DATA_ALREADY_LOCKED:String =
  'WR:3002 - WireData already locked with token - call unlock method first with proper token';
export const ERROR__DATA_IS_GETTER:String =
  'WR:3003 - WireData is a getter - it cannot be modified only accessed'
export const ERROR__VALUE_IS_NOT_ALLOWED_TOGETHER_WITH_GETTER:String =
  'WR:3004 - WireData is a getter - setting value together with getter is not allowed' ;
