import { Dropin } from "braintree-web-drop-in";

export const createMockedDropIn = (overrides?: Partial<Dropin>): Dropin => {
  const defaultDropIn: Dropin = {
    requestPaymentMethod: jest.fn().mockReturnValue({
      nonce: "mockNonce",
      deviceData: "mockDeviceData",
    }),
    on: jest.fn(),
    teardown: jest.fn(),
    off: jest.fn(),
    clearSelectedPaymentMethod: jest.fn(),
    isPaymentMethodRequestable: jest.fn().mockReturnValue(true),
    updateConfiguration: jest.fn(),
  };

  return {
    ...defaultDropIn,
    ...overrides,
  };
};
