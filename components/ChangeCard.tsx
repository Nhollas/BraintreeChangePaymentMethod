"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import BraintreeNew from "./BraintreeNew";

export const formSchema = z.object({
  nonce: z.string(),
  deviceData: z.string(),
});

export default function ChangeCard({ clientToken }: { clientToken: string }) {
  const [showBraintree, setShowBraintree] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nonce: "",
      deviceData: "",
    },
  });

  const values = form.watch();

  const Submit =(props: any) => {
    return (
      <div>
        {props.children}
        <button
          disabled={values.nonce === ""}
          className="bg-green-600 px-6 py-2 rounded-lg mt-6"
        >
          Submit
        </button>
      </div>
    );
  }

  return showBraintree ? (
  <Submit>          
    <BraintreeNew
        clientToken={clientToken}
        hideBraintree={setShowBraintree}
        form={form}
      />
    <Submit />
  ) : (
    <button
      onClick={() => setShowBraintree(true)}
      className="bg-green-600 px-6 py-2 rounded-lg mt-6"
    >
      Load Braintree
    </button>
  );
}
