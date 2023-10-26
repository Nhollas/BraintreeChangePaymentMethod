import braintree, { Dropin } from "braintree-web-drop-in";

import { Dispatch, SetStateAction, useEffect, useRef } from "react";
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
  const dropinInstanceRef = useRef<Dropin | undefined>();

  useEffect(() => {
    const handlePaymentMethodRequestable = () => {
      if (!dropinInstanceRef.current) return;

      dropinInstanceRef.current
        .requestPaymentMethod()
        .then(async (payload) => {
          console.log("Setting nonce values:", payload);
          form.setValue("nonce", payload.nonce);
          form.setValue("deviceData", payload.deviceData || "");
        })
        .catch((error) => console.log(error));
    };

    console.log("We are initializeBraintree");
    async function initializeBraintree() {
      try {
        const instance = await braintree.create({
          authorization: clientToken,
          container: "#dropin-container",
          dataCollector: true,
        });

        dropinInstanceRef.current = instance;

        instance?.on("paymentMethodRequestable", () => {
          console.log("paymentMethodRequestable");

          handlePaymentMethodRequestable();
        });
      } catch (error) {}
    }

    initializeBraintree();

    return () => {
      console.log("Cleanup required on aisle 4");

      if (dropinInstanceRef.current) {
        dropinInstanceRef.current.teardown();
      }

      if (form) {
        form.reset();
      }
    };
  }, [clientToken, form]);

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
