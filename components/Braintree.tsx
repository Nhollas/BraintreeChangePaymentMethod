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
      console.log(
        "We are in handlePaymentMethodRequestable",
        dropinInstance.current,
      );

      if (!dropinInstance.current) {
        return;
      }

      try {
        const payload = await dropinInstance.current.requestPaymentMethod();
        const { nonce, deviceData } = payload;
        const currentNonce = form.getValues("nonce");
        const currentDeviceData = form.getValues("deviceData");

        if (currentNonce === nonce && currentDeviceData === deviceData) {
          console.log(
            "Nonce is the same, skipping. Don't want to cause a pointless re-render",
          );
        } else {
          console.log("Setting nonce values:", payload);

          form.setValue("nonce", nonce);
          form.setValue("deviceData", deviceData);
        }
      } catch (error) {
        console.error("Error with requestPaymentMethod:", error);
      }
    }

    async function setupInitialPaymentMethod() {
      console.log("We are in handleDropinInstance");

      if (dropinInstance.current?.isPaymentMethodRequestable()) {
        handlePaymentMethodRequestable();
      }
    }

    function handlePaymentMethodRequestableEvent() {
      console.log("paymentMethodRequestable");

      handlePaymentMethodRequestable();
    }

    async function initializeBraintree() {
      console.log("We are initializeBraintree");

      braintree
        .create({
          authorization: clientToken,
          container: "#dropin-container",
          dataCollector: true,
          vaultManager: true,
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
      console.log("Cleanup required on aisle 4");
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
