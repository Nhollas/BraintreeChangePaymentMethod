import React from "react";
import "@testing-library/jest-dom";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import Braintree from "./Braintree"; // Import your component here

// Mock dependencies or functions that are used within the component
const mockClientToken = "your-mock-client-token";
const mockFormValueSetter = jest.fn();

const mockForm = {
  setValue: mockFormValueSetter,
  reset: jest.fn(),
};

describe("Braintree Component", () => {
  it("should call handlePaymentMethodRequestable and set form values", async () => {
    render(
      <Braintree
        clientToken={mockClientToken}
        hideBraintree={() => {}}
        form={mockForm}
      />,
    );

    // Simulate the event that triggers handlePaymentMethodRequestable
    fireEvent.click(screen.getByText("Hide Braintree"));

    // Mock payload returned from requestPaymentMethod
    const mockPayload = {
      nonce: "mock-nonce",
      deviceData: "mock-device-data",
    };

    // Simulate the payload returned by requestPaymentMethod
    await waitFor(() => {
      expect(mockFormValueSetter).toHaveBeenCalledWith("nonce", "mock-nonce");
      expect(mockFormValueSetter).toHaveBeenCalledWith(
        "deviceData",
        "mock-device-data",
      );
    });

    // You can also add assertions related to other aspects of your component if needed
  });
});
