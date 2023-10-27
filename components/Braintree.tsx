import braintree from "braintree-web-drop-in";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  nonce: z.string(),
  deviceData: z.string().optional(),
});

type BraintreeProps = {
  clientToken: string;
  form: UseFormReturn<z.infer<typeof formSchema>>;
};

export default function Braintree({ clientToken, form }: BraintreeProps) {
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
        const isPayloadSameAsCurrent = (
          payload: braintree.PaymentMethodPayload,
          form: UseFormReturn<any>
        ) => {
          const { nonce, deviceData } = payload;
          const currentNonce = form.getValues("nonce");
          const currentDeviceData = form.getValues("deviceData");

          return currentNonce === nonce && currentDeviceData === deviceData;
        };

        if (!isPayloadSameAsCurrent(payload, form)) {
          form.setValue("nonce", payload.nonce);
          form.setValue("deviceData", payload.deviceData);
        }
      } catch (error) {
        // Ignoring these isn't ideal
      }
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

  return <div id="dropin-container"></div>;
}
