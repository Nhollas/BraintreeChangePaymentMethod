import React from "react";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Braintree from "./Braintree";
import dropIn, { Dropin } from "braintree-web-drop-in";

describe("When the Braintree DropIn UI loads", () => {
  let form: any;
  let closeBraintree: jest.Mock;
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

    closeBraintree = jest.fn();

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

  test("It should set the forms initial payment information", async () => {
    jest.spyOn(dropIn, "create").mockResolvedValue(mockDropIn);

    // Override the getValues function to return something different.
    form.getValues = jest.fn().mockReturnValueOnce("").mockReturnValueOnce("");

    render(
      <Braintree
        clientToken="mockClientToken"
        form={form}
        closeBraintree={closeBraintree}
      />
    );

    await waitFor(() => {
      expect(dropIn.create).toHaveBeenCalled();
    });

    expect(form.getValues).toHaveBeenCalledWith("nonce");
    expect(form.getValues).toHaveBeenCalledWith("deviceData");
    expect(form.setValue).toHaveBeenCalledWith("nonce", "mockNonce");
    expect(form.setValue).toHaveBeenCalledWith("deviceData", "mockDeviceData");
  });

  test("If existing payment information values are the same, we shouldn't set the same payment information", async () => {
    jest.spyOn(dropIn, "create").mockResolvedValue(mockDropIn);

    render(
      <Braintree
        clientToken="mockClientToken"
        form={form}
        closeBraintree={closeBraintree}
      />
    );

    await waitFor(() => {
      expect(dropIn.create).toHaveBeenCalled();
    });

    expect(form.getValues).toHaveBeenCalledWith("nonce");
    expect(form.getValues).toHaveBeenCalledWith("deviceData");
    expect(form.setValue).not.toHaveBeenCalled();
  });

  test("It should clean up after itself when the component unmounts", async () => {
    jest.spyOn(dropIn, "create").mockResolvedValue(mockDropIn);

    const { unmount } = render(
      <Braintree
        clientToken="mockClientToken"
        form={form}
        closeBraintree={closeBraintree}
      />
    );

    await waitFor(() => {
      expect(dropIn.create).toHaveBeenCalled();
    });

    unmount();

    expect(mockDropIn.teardown).toHaveBeenCalled();
    expect(form.reset).toHaveBeenCalled();
  });
});
