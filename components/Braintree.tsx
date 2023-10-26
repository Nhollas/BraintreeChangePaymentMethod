"use client";

import axios from "axios";
import braintree, { Dropin } from "braintree-web-drop-in";
import clsx from "clsx";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
export default function Braintree({
  clientToken,
  hideBraintree
}: {
  clientToken: string;
  hideBraintree: Dispatch<SetStateAction<boolean>>;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [dropinInstance, setDropinInstance] = useState<Dropin | undefined>(undefined);
  const [requestable, setRequestable] = useState(0);

  console.log("requestable", requestable)

  const [returnedCard, setReturnedCard] = useState({});

  useEffect(() => {
    async function initializeBraintree() {
      if (dropinInstance) {
        await dropinInstance.teardown()
        setDropinInstance(undefined)
      }

     const instance = await braintree.create(
        {
          authorization: clientToken,
          container: "#dropin-container",
          dataCollector: true,
        },
      );

      instance?.on("paymentMethodRequestable", () => {
        console.log("paymentMethodRequestable");
        setRequestable((prev) => prev + 1);
      });

      instance?.on("changeActiveView", (d) => {
        console.log("changeActiveView", d)
      })

      instance?.on("noPaymentMethodRequestable", () => {
        console.log("noPaymentMethodRequestable");
        setRequestable(0);
      });

      setDropinInstance(instance)
    }

    initializeBraintree();
  }, [clientToken, dropinInstance]);

  useEffect(() => {
    console.log("We are going to try and send request")
    console.log("requestable", requestable)
    console.log("dropinInstance", dropinInstance)
    if (requestable !== 0 && dropinInstance) {
      console.log("We are going to send a request")
      dropinInstance.requestPaymentMethod(
      async function (requestPaymentMethodErr, payload) {
        if (requestPaymentMethodErr) {
          console.log("requestPaymentMethodErr", requestPaymentMethodErr);
          return;
        }

        const requestBody = {
          nonce: payload.nonce,
          deviceData: payload.deviceData
        }

        const response = await axios.put("https://zkf2h5-3000.csb.app/api/customer/card", requestBody)

        setReturnedCard(response.data);

        console.log("response", response);
      },
      )
    }
  }, [requestable, dropinInstance])

  return (
    <section className="w-full h-full">
      <button
        onClick={() => hideBraintree(false)}
        className="bg-green-600 px-6 py-2 rounded-lg mt-6"
      >
        Hide Braintree
      </button>

      <div id="dropin-container"></div>
      <button
        //disabled={!requestable}
        className={clsx(
          //!requestable && "bg-gray-500",
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
