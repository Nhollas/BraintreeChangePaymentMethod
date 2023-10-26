"use client";

import braintree, { Dropin } from "braintree-web-drop-in";

import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "./ChangeCard";
import { z } from "zod";

export default function BraintreeNew({
  clientToken,
  hideBraintree,
  form,
}: {
  clientToken: string;
  hideBraintree: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  const [requestable, setRequestable] = useState(0);
  const dropinInstanceRef = useRef<Dropin | undefined>();

  useEffect(() => {
    console.log("We are initializeBraintree", clientToken);
    async function initializeBraintree() {
      try {
        console.log("dropinInstanceRef", dropinInstanceRef.current);
        if (dropinInstanceRef.current) {
          await dropinInstanceRef.current.teardown();
          dropinInstanceRef.current = undefined;
        }

        const instance = await braintree.create({
          authorization: clientToken,
          container: "#dropin-container",
          dataCollector: true,
        });

        console.log("instance", instance);

        const handlePaymentMethodRequestable = () => {
          setRequestable((prevCount) => prevCount + 1);
        };

        const handleNoPaymentMethodRequestable = () => {
          setRequestable(0);
        };

        instance.on("paymentOptionSelected", () => {
          console.log("paymentOptionSelected");
        });

        instance?.on("paymentMethodRequestable", () => {
          console.log("paymentMethodRequestable");

          handlePaymentMethodRequestable();
        });

        instance?.on("noPaymentMethodRequestable", () => {
          console.log("noPaymentMethodRequestable");

          handleNoPaymentMethodRequestable();
        });

        dropinInstanceRef.current = instance;
      } catch (error) {}
    }

    initializeBraintree();

    return () => {
      if (dropinInstanceRef.current) {
        dropinInstanceRef.current.teardown();
      }
    };
  }, [clientToken]);

  useEffect(() => {
    console.log("requestable", requestable);
    console.log("dropinInstance", dropinInstanceRef.current);
    if (requestable !== 0 && dropinInstanceRef.current) {
      dropinInstanceRef.current
        .requestPaymentMethod()
        .then(async (payload) => {
          console.log("Setting nonce values:", payload);

          form.setValue("nonce", payload.nonce);
          form.setValue("deviceData", payload.deviceData || "");
        })
        .catch((error) => console.log(error));
    }

    return () => {
      if (form) {
        form.reset();
      }
    };
  }, [requestable, form]);

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
