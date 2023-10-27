import React from "react";
import { render, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Braintree from "./Braintree";
import dropIn from "braintree-web-drop-in";
import { createMockedDropIn } from "./braintree-web-drop-in";

describe("When the Braintree DropIn UI loads:", () => {
  let form: any;

  beforeEach(() => {
    form = {
      setValue: jest.fn(),
      reset: jest.fn(),
    };
  });

  test("If we have a requestable payment method, then we should try to request a payment method", async () => {
    const mockDropIn = createMockedDropIn();
    jest.spyOn(dropIn, "create").mockResolvedValue(mockDropIn);

    render(
      <Braintree
        clientToken="mockClientToken"
        form={form}
        closeBraintree={() => {}}
      />
    );

    await waitFor(() => {
      expect(dropIn.create).toHaveBeenCalled();
      expect(mockDropIn.requestPaymentMethod).toHaveBeenCalled();
    });

    expect(form.setValue).toHaveBeenCalledWith("nonce", "mockNonce");
    expect(form.setValue).toHaveBeenCalledWith("deviceData", "mockDeviceData");
  });

  test("It should clean up the form state and dropIn instance when the component unmounts", async () => {
    const mockDropIn = createMockedDropIn();

    jest.spyOn(dropIn, "create").mockResolvedValue(mockDropIn);

    const { unmount } = render(
      <Braintree
        clientToken="mockClientToken"
        form={form}
        closeBraintree={() => {}}
      />
    );

    await waitFor(() => {
      expect(dropIn.create).toHaveBeenCalled();
    });

    unmount();

    expect(mockDropIn.teardown).toHaveBeenCalled();
    expect(form.reset).toHaveBeenCalled();
  });

  test("If we don't have a requestable payment method, we shouldn't try to request a payment method", async () => {
    const mockDropIn = createMockedDropIn({
      isPaymentMethodRequestable: () => false,
    });

    jest.spyOn(dropIn, "create").mockResolvedValue(mockDropIn);

    render(
      <Braintree
        clientToken="mockClientToken"
        form={form}
        closeBraintree={() => {}}
      />
    );

    await waitFor(() => {
      expect(dropIn.create).toHaveBeenCalled();
    });

    expect(form.setValue).not.toHaveBeenCalled();
    expect(mockDropIn.requestPaymentMethod).not.toHaveBeenCalled();
  });

  test("If a 'paymentMethodRequestable' event is fired, it should trigger us to request a payment method", async () => {
    const onEventCaptureFunc = jest.fn();

    const mockDropIn = createMockedDropIn({
      on: onEventCaptureFunc,
      isPaymentMethodRequestable: () => false,
    });

    jest.spyOn(dropIn, "create").mockResolvedValue(mockDropIn);

    render(
      <Braintree
        clientToken="mockClientToken"
        form={form}
        closeBraintree={() => {}}
      />
    );

    await waitFor(() => {
      expect(dropIn.create).toHaveBeenCalled();
    });

    const callback = onEventCaptureFunc.mock.calls[0][1];

    act(() => {
      callback();
    });

    await waitFor(() => {
      expect(mockDropIn.requestPaymentMethod).toHaveBeenCalled();
    });

    expect(form.setValue).toHaveBeenCalledWith("nonce", "mockNonce");
    expect(form.setValue).toHaveBeenCalledWith("deviceData", "mockDeviceData");
  });
});
