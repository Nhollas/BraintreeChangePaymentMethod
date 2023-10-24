"use client";

import braintree from "braintree-web-drop-in";

import { useEffect, useRef } from "react";
export default function Braintree({
  clientAuthorization,
}: {
  clientAuthorization: string;
}) {
  const dropinRef = useRef(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    async function handlePayment(
      createErr: object | null,
      instance?: braintree.Dropin,
    ) {
      buttonRef.current?.addEventListener("click", function () {
        instance?.requestPaymentMethod(
          async function (requestPaymentMethodErr, payload) {
            if (requestPaymentMethodErr) {
              return;
            }

            const { nonce } = payload;

            console.log(nonce);
            console.log(payload.deviceData);
          },
        );
      });
    }

    async function initializeBraintree() {
      const instance = braintree.create(
        {
          authorization: clientAuthorization,
          container: dropinRef.current || "#dropin-container",
          dataCollector: true,
          card: {
            overrides: {
              fields: {
                number: {
                  placeholder: "Card Number",
                },
                cvv: {
                  placeholder: "CVV",
                },
                expirationDate: {
                  placeholder: "MM/YY",
                },
              },
            },
          },
        },
        handlePayment,
      );
    }

    initializeBraintree();
  }, [clientAuthorization]);

  return (
    <section>
      <div id="dropin-container" ref={dropinRef}></div>
      <button ref={buttonRef}>Pay</button>
    </section>
  );
}
