"use client";

import axios from "axios";
import braintree from "braintree-web-drop-in";
import clsx from "clsx";

import { useEffect, useRef, useState } from "react";
export default function Braintree({ clientToken }: { clientToken: string }) {
  const dropinRef = useRef(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [requestable, setRequestable] = useState(false);
  const [returnedCard, setReturnedCard] = useState({});

  useEffect(() => {
    async function handlePayment(
      createErr: object | null,
      instance?: braintree.Dropin,
    ) {
      instance?.on("paymentMethodRequestable", () => {
        console.log("paymentMethodRequestable");
        setRequestable(true);
      });

      instance?.on("noPaymentMethodRequestable", () => {
        console.log("noPaymentMethodRequestable");
        setRequestable(false);
      });

      buttonRef.current?.addEventListener("click", function () {
        instance?.requestPaymentMethod(
          async function (requestPaymentMethodErr, payload) {
            if (requestPaymentMethodErr) {
              return;
            }

            const { nonce } = payload;

            const requestBody = {
              nonce: payload.nonce,
              deviceData: payload.deviceData,
            };

            const response = await axios.put(
              "https://zkf2h5-3000.csb.app/api/customer/card",
              requestBody,
            );

            setReturnedCard(response.data);

            console.log("response", response);

            console.log(nonce);
            console.log(payload.deviceData);
          },
        );
      });
    }

    async function initializeBraintree() {
      braintree.create(
        {
          authorization: clientToken,
          container: dropinRef.current || "#dropin-container",
          dataCollector: true,
        },
        handlePayment,
      );
    }

    initializeBraintree();
  }, [clientToken]);

  return (
    <section className="w-full h-full">
      <div id="dropin-container" ref={dropinRef}></div>
      <button
        disabled={!requestable}
        className={clsx(
          !requestable && "bg-gray-500",
          "bg-blue-600 px-6 py-2 rounded-lg mt-6",
        )}
        ref={buttonRef}
      >
        Change Card
      </button>

      <pre className="text-sm mt-6">
        {JSON.stringify(returnedCard, null, 4)}
      </pre>
    </section>
  );
}
