import braintree from "braintree-web-drop-in";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  nonce: z.string(),
  deviceData: z.string().optional(),
});

type BraintreeProps = {
  clientToken: string;
  form: UseFormReturn<z.infer<typeof formSchema>>;
  closeBraintree: Dispatch<SetStateAction<boolean>>;
};

export default function Braintree({
  clientToken,
  form,
  closeBraintree,
}: BraintreeProps) {
  const [isDomLoaded, setIsDomLoaded] = useState(false);

  const dropinInstance = useRef<braintree.Dropin | undefined>(undefined);

  useEffect(() => {
    /*
      This delay is required to ensure that the DOM is
      loaded before we try to initialize Braintree.
    */
    setIsDomLoaded(true);
  }, []);

  useEffect(() => {
    if (!isDomLoaded) {
      return;
    }

    async function handlePaymentMethodRequestable() {
      if (!dropinInstance.current) {
        return;
      }

      try {
        const payload = await dropinInstance.current.requestPaymentMethod();

        form.setValue("nonce", payload.nonce);
        form.setValue("deviceData", payload.deviceData);
      } catch (error) {}
    }

    async function initializeBraintree() {
      if (dropinInstance.current) {
        dropinInstance.current.teardown();
      }

      braintree
        .create({
          authorization: clientToken,
          container: "#dropin-container",
          dataCollector: true,
        })
        .then((instance) => {
          dropinInstance.current = instance;

          // Subscribe to any future paymentMethodRequestable events.
          instance.on(
            "paymentMethodRequestable",
            handlePaymentMethodRequestable
          );

          // If we already have a vaulted payment method, we should request it.
          if (instance.isPaymentMethodRequestable()) {
            handlePaymentMethodRequestable();
          }
        })
        .catch((error) => console.error("initializeBraintree", error));
    }

    initializeBraintree();

    return () => {
      if (dropinInstance.current) {
        dropinInstance.current.teardown();
      }

      form.reset();
    };
  }, [clientToken, form, isDomLoaded]);

  return (
    <section className="w-full h-full">
      <button
        onClick={() => closeBraintree(false)}
        className="bg-green-600 px-6 py-2 rounded-lg mt-6"
      >
        Close Braintree
      </button>
      <div id="dropin-container"></div>
    </section>
  );
}
