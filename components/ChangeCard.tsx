"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Braintree from "./Braintree";
import clsx from "clsx";

export const formSchema = z.object({
  nonce: z.string(),
  deviceData: z.string().optional(),
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

  return showBraintree ? (
    <>
      <button
        disabled={values.nonce === ""}
        className={clsx(
          "px-6 py-2 rounded-lg mt-6 text-white",
          values.nonce === "" ? "bg-red-600" : "bg-green-600"
        )}
      >
        Submit
      </button>
      <Braintree
        clientToken={clientToken}
        closeBraintree={setShowBraintree}
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
