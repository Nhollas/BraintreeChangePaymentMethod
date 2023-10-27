"use strict";

import { Dropin } from "braintree-web-drop-in";

const dropIn = jest.createMockFromModule("braintree-web-drop-in") as any;

const mockDropInInstance: Dropin = {
  requestPaymentMethod: jest
    .fn()
    .mockName("requestPaymentMethod")
    .mockReturnValue({
      nonce: "mockNonce",
      deviceData: "mockDeviceData",
    }),
  on: jest.fn().mockName("on"),
  teardown: jest.fn().mockName("teardown"),
  off: jest.fn().mockName("off"),
  clearSelectedPaymentMethod: jest.fn().mockName("clearSelectedPaymentMethod"),
  isPaymentMethodRequestable: jest
    .fn()
    .mockName("isPaymentMethodRequestable")
    .mockReturnValue(true),
  updateConfiguration: jest.fn().mockName("updateConfiguration"),
};

dropIn.create.mockResolvedValue(mockDropInInstance);

module.exports = dropIn;
