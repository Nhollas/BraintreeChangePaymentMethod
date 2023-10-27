import braintree from "braintree-web-drop-in";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { UseFormReturn, set } from "react-hook-form";
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
  const [isDomLoaded, setIsDomLoaded] = useState(false);

  useEffect(() => {
    setIsDomLoaded(true);
  }, []);

  useEffect(() => {
    if (!isDomLoaded) {
      return;
    }

    let dropinInstance: braintree.Dropin | undefined;

    const handlePaymentMethodRequestable = async (
      instance: braintree.Dropin
    ) => {
      console.log("We are in handlePaymentMethodRequestable", instance);

      try {
        const payload = await instance.requestPaymentMethod();
        console.log("Setting nonce values:", payload);

        if (
          form.getValues("nonce") === payload.nonce &&
          form.getValues("deviceData") === payload.deviceData
        ) {
          console.log("Nonce is the same, skipping");
        } else {
          form.setValue("nonce", payload.nonce);
          form.setValue("deviceData", payload.deviceData || "");
        }
      } catch (error) {
        console.log("Error with requestPaymentMethod:", error);

        setTimeout(handleDropinInstance, 1000, instance);
      }
    };

    async function handleDropinInstance(instance: braintree.Dropin) {
      console.log("We are in handleDropinInstance");

      if (instance.isPaymentMethodRequestable()) {
        handlePaymentMethodRequestable(instance);
      }

      instance.on("paymentMethodRequestable", () => {
        console.log("paymentMethodRequestable");

        handlePaymentMethodRequestable(instance);
      });

      dropinInstance = instance;
    }

    async function initializeBraintree() {
      console.log("We are initializeBraintree");

      braintree
        .create({
          authorization: clientToken,
          container: "#dropin-container",
          dataCollector: true,
        })
        .then(handleDropinInstance)
        .catch((error) => console.log("initializeBraintree", error));
    }

    initializeBraintree();

    return () => {
      console.log("Cleanup required on aisle 4");

      if (dropinInstance) {
        dropinInstance?.teardown();
      }

      form.reset();
    };
  }, [clientToken, form, isDomLoaded]);

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
