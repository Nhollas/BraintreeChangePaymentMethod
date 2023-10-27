import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChangeCard from "./ChangeCard";
import braintree, { Dropin } from "braintree-web-drop-in";

test("If we have a requestable payment method, then we should try to request a payment method", async () => {
  const mockedDropIn = braintree as jest.Mocked<typeof braintree>;

  render(<ChangeCard clientToken="mockClientToken" />);

  fireEvent.click(screen.getByText("Load Braintree"));

  expect(
    screen.getByRole("button", {
      name: "Submit (this is disabled if no nonce)",
    })
  ).toBeDisabled();

  const mockedInstance = (await mockedDropIn.create.mock.results[0]
    .value) as Dropin;

  await waitFor(() => {
    expect(mockedDropIn.create).toHaveBeenCalled();
    expect(mockedInstance.requestPaymentMethod).toHaveBeenCalled();
    expect(
      screen.getByRole("button", {
        name: "Submit (this is disabled if no nonce)",
      })
    ).toBeEnabled();
  });
});
