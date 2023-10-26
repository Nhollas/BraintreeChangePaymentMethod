"use client";

import axios from "axios";
import braintree, { Dropin } from "braintree-web-drop-in";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "./ChangeCard";
import { z } from "zod";

export default function Braintree({
  clientToken,
  hideBraintree,
  form,
}: {
  clientToken: string;
  hideBraintree: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  const [dropinInstance, setDropinInstance] = useState<Dropin | undefined>(
    undefined,
  );
  const [requestable, setRequestable] = useState(0);

  useEffect(() => {
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
          setRequestable((prev) => prev + 1);
        });

        instance?.on("noPaymentMethodRequestable", () => {
          console.log("noPaymentMethodRequestable");
          setRequestable(0);
        });

        setDropinInstance(instance);
      } catch (error) {}
    }

    initializeBraintree();
  }, []);

  useEffect(() => {
    console.log("We are going to try and send request");
    console.log("requestable", requestable);
    console.log("dropinInstance", dropinInstance);
    if (requestable !== 0 && dropinInstance) {
      console.log("Sending request");
      dropinInstance
        .requestPaymentMethod()
        .then(async (payload) => {
          const requestBody = {
            nonce: payload.nonce,
            deviceData: payload.deviceData,
          };

          form.setValue("nonce", payload.nonce);
          form.setValue("deviceData", payload.deviceData || "");
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
    </section>
  );
}
