import { expect, test, describe } from 'vitest';

import Wire from '../src/wire';
import { WireDataGetter } from '../src/types';
import { IWireData } from '../src/interfaces';

const print = console.log;

describe('5. Data getters', async () => {
  const DATA_KEY_USER_VO = 'dataKeyUserVO';
  const GET__USER_FULL_NAME = 'getUserFullName';
  const dataUserVO = {
    firstName: 'Wires',
    lastName: 'Ware',
  };

  const nameFormatter = (userVO: any) => `${userVO['firstName']} ${userVO['lastName']}`;

  Wire.data(DATA_KEY_USER_VO, dataUserVO).subscribe(async (value: any) => {
    print(`> $DATA_KEY_USER_VO -> updated: ${value}`);
  });

  const wireDataGetter: WireDataGetter = (that: IWireData) => {
    const wireData = Wire.data(DATA_KEY_USER_VO);
    const userVO = wireData.value!;
    print(`> $GET__USER_FULL_NAME -> get: ${that.key} isSet ${that.isSet}`);
    return nameFormatter(userVO);
  };
  Wire.data(GET__USER_FULL_NAME, null, wireDataGetter);

  test('5.1 Getter', async () => {
    print('>\t Wire.data(GET__USER_FULL_NAME).isLocked');
    expect(() => Wire.data(GET__USER_FULL_NAME).subscribe(async () => Promise.resolve())).toThrowError();
    expect(Wire.data(GET__USER_FULL_NAME).isLocked).toBeTruthy();
    expect(Wire.data(GET__USER_FULL_NAME).isGetter).toBeTruthy();
    expect(Wire.data(GET__USER_FULL_NAME).value).toBe(nameFormatter(dataUserVO));

    const wireData = Wire.data(DATA_KEY_USER_VO);
    const userVO = wireData.value;
    userVO['lastName'] = 'Cores';
    Wire.data(DATA_KEY_USER_VO, userVO);

    expect(Wire.data(GET__USER_FULL_NAME).value).toBe(`${dataUserVO['firstName']} Cores`);
    expect(() => Wire.data(GET__USER_FULL_NAME, 'new value')).toThrowError();
  });
});
