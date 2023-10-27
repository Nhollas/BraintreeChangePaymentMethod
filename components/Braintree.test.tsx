import React from "react";
import { render, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Braintree from "./Braintree";
import dropIn, { Dropin } from "braintree-web-drop-in";

describe("When the Braintree DropIn UI loads:", () => {
  let form: any;
  let mockDropIn: Dropin;

  beforeEach(() => {
    form = {
      getValues: jest
        .fn()
        .mockReturnValueOnce("mockNonce")
        .mockReturnValueOnce("mockDeviceData"),
      setValue: jest.fn(),
      reset: jest.fn(),
    };

    mockDropIn = {
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
  });

  test("If we have a requestable payment method, then we should try to request a payment method", async () => {
    jest.spyOn(dropIn, "create").mockResolvedValue(mockDropIn);

    // Override the getValues function to return something different.
    form.getValues = jest
      .fn()
      .mockReturnValueOnce("differentNonce")
      .mockReturnValueOnce("differentDeviceData");

    render(<Braintree clientToken="mockClientToken" form={form} />);

    await waitFor(() => {
      expect(dropIn.create).toHaveBeenCalled();
      expect(mockDropIn.requestPaymentMethod).toHaveBeenCalled();
    });

    expect(form.getValues).toHaveBeenCalledWith("nonce");
    expect(form.getValues).toHaveBeenCalledWith("deviceData");
    expect(form.setValue).toHaveBeenCalledWith("nonce", "mockNonce");
    expect(form.setValue).toHaveBeenCalledWith("deviceData", "mockDeviceData");
  });

  test("If existing payment method values are the same, we shouldn't update our form state", async () => {
    jest.spyOn(dropIn, "create").mockResolvedValue(mockDropIn);

    render(<Braintree clientToken="mockClientToken" form={form} />);

    await waitFor(() => {
      expect(dropIn.create).toHaveBeenCalled();
      expect(mockDropIn.requestPaymentMethod).toHaveBeenCalled();
    });

    expect(form.getValues).toHaveBeenCalledWith("nonce");
    expect(form.getValues).toHaveBeenCalledWith("deviceData");
    expect(form.setValue).not.toHaveBeenCalled();
  });

  test("It should clean up the form state and dropIn instance when the component unmounts", async () => {
    jest.spyOn(dropIn, "create").mockResolvedValue(mockDropIn);

    const { unmount } = render(
      <Braintree clientToken="mockClientToken" form={form} />
    );

    await waitFor(() => {
      expect(dropIn.create).toHaveBeenCalled();
    });

    unmount();

    expect(mockDropIn.teardown).toHaveBeenCalled();
    expect(form.reset).toHaveBeenCalled();
  });

  test("If we don't have a requestable payment method, we shouldn't try to request a payment method", async () => {
    mockDropIn.isPaymentMethodRequestable = jest.fn().mockReturnValue(false);

    jest.spyOn(dropIn, "create").mockResolvedValue(mockDropIn);

    render(<Braintree clientToken="mockClientToken" form={form} />);

    await waitFor(() => {
      expect(dropIn.create).toHaveBeenCalled();
    });

    expect(form.setValue).not.toHaveBeenCalled();
    expect(form.getValues).not.toHaveBeenCalled();
    expect(mockDropIn.requestPaymentMethod).not.toHaveBeenCalled();
  });

  test("If a 'paymentMethodRequestable' event is fired, it should trigger us to request a payment method", async () => {
    const eventCaptureFunc = jest.fn();

    mockDropIn.on = eventCaptureFunc;
    mockDropIn.isPaymentMethodRequestable = jest.fn().mockReturnValue(false);

    // Override the getValues function to return something different.
    form.getValues = jest
      .fn()
      .mockReturnValueOnce("differentNonce")
      .mockReturnValueOnce("differentDeviceData");

    jest.spyOn(dropIn, "create").mockResolvedValue(mockDropIn);

    render(<Braintree clientToken="mockClientToken" form={form} />);

    await waitFor(() => {
      expect(dropIn.create).toHaveBeenCalled();
    });

    const triggerEvent = eventCaptureFunc.mock.calls[0][1];

    act(() => {
      triggerEvent();
    });

    await waitFor(() => {
      expect(mockDropIn.requestPaymentMethod).toHaveBeenCalled();
    });

    expect(form.getValues).toHaveBeenCalledWith("nonce");
    expect(form.getValues).toHaveBeenCalledWith("deviceData");

    expect(form.setValue).toHaveBeenCalledWith("nonce", "mockNonce");
    expect(form.setValue).toHaveBeenCalledWith("deviceData", "mockDeviceData");
  });
});
