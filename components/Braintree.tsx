"use client";

import axios from "axios";
import braintree, { Dropin } from "braintree-web-drop-in";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
export default function Braintree({
  clientToken,
  hideBraintree,
}: {
  clientToken: string;
  hideBraintree: Dispatch<SetStateAction<boolean>>;
}) {
  const [dropinInstance, setDropinInstance] = useState<Dropin | undefined>(
    undefined,
  );
  const [requestable, setRequestable] = useState(false);

  const [returnedCard, setReturnedCard] = useState({});

  useEffect(() => {
    if (clientToken === undefined) return;

    async function initializeBraintree() {
      try {
        if (dropinInstance) {
          await dropinInstance.teardown();
          setDropinInstance(undefined);
        }

        const instance = await braintree.create({
          authorization: clientToken,
          container: "#dropin-container",
          dataCollector: true,
        });

        instance?.on("paymentMethodRequestable", () => {
          console.log("paymentMethodRequestable");
          setRequestable(true);
        });

        instance?.on("noPaymentMethodRequestable", () => {
          console.log("noPaymentMethodRequestable");
          setRequestable(false);
        });

        setDropinInstance(instance);
      } catch (error) {}
    }

    if (clientToken) {
      initializeBraintree();
    }
  }, [clientToken]);

  useEffect(() => {
    console.log("We are going to try and send request");
    console.log("requestable", requestable);
    console.log("dropinInstance", dropinInstance);
    if (requestable && dropinInstance) {
      console.log("Sending request");
      dropinInstance
        .requestPaymentMethod()
        .then(async (payload) => {
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
        })
        .catch((error) => console.log(error));
    }
  }, [requestable]);

  return (
    <section className="w-full h-full">
      <button
        onClick={() => hideBraintree(false)}
        className="bg-green-600 px-6 py-2 rounded-lg mt-6"
      >
        Hide Braintree
      </button>

      <div id="dropin-container"></div>
      {/* <button
        //disabled={!requestable}
        className={clsx(
          //!requestable && "bg-gray-500",
          "bg-blue-600 px-6 py-2 rounded-lg mt-6",
        )}
      >
        Change Card
      </button> */}
      <pre className="text-sm mt-6">
        {JSON.stringify(returnedCard, null, 4)}
      </pre>
    </section>
  );
}
