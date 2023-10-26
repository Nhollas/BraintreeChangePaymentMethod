"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Braintree from "./Braintree";
import clsx from "clsx";

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

  console.log("values", values);

  return showBraintree ? (
    <>
      <button
        disabled={values.nonce === ""}
        className={clsx(
          "px-6 py-2 rounded-lg mt-6",
          values.nonce === ""
            ? "bg-gray-50 text-black"
            : "bg-blue-600 text-white",
        )}
      >
        Submit (this is disabled if no nonce)
      </button>
      <Braintree
        clientToken={clientToken}
        hideBraintree={setShowBraintree}
        form={form}
      />
    </>
  ) : (
    <button
      onClick={() => setShowBraintree(true)}
      className="bg-green-600 px-6 py-2 rounded-lg mt-6"
    >
      Load Braintree
    </button>
  );
}
