import braintree from "braintree-web-drop-in";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "./ChangeCard";
import { z } from "zod";

type BraintreeProps = {
  clientToken: string;
  closeBraintree: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<z.infer<typeof formSchema>>;
};

export default function Braintree({
  clientToken,
  closeBraintree,
  form,
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
        const { nonce, deviceData } = payload;
        const currentNonce = form.getValues("nonce");
        const currentDeviceData = form.getValues("deviceData");

        console.log("Payload", payload);

        console.log("currentNonce", currentNonce);
        console.log("currentDeviceData", currentDeviceData);

        if (currentNonce === nonce && currentDeviceData === deviceData) {
          // Nothing happens
        } else {
          form.setValue("nonce", nonce);
          form.setValue("deviceData", deviceData);
        }
      } catch (error) {}
    }

    async function setupInitialPaymentMethod() {
      if (dropinInstance.current?.isPaymentMethodRequestable()) {
        handlePaymentMethodRequestable();
      }
    }

    function handlePaymentMethodRequestableEvent() {
      console.log("We have answered the phone");

      handlePaymentMethodRequestable();
    }

    async function initializeBraintree() {
      braintree
        .create({
          authorization: clientToken,
          container: "#dropin-container",
          dataCollector: true,
          vaultManager: false,
        })
        .then((instance) => {
          instance.on(
            "paymentMethodRequestable",
            handlePaymentMethodRequestableEvent,
          );

          dropinInstance.current = instance;

          setupInitialPaymentMethod();
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
