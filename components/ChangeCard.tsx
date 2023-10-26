"use client";

import { useState } from "react";
import Braintree from "./Braintree";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolves/zod";
import { z } from "zod";

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

  console.log("Form values:", values);

  return showBraintree ? (
    <Braintree
      clientToken={clientToken}
      hideBraintree={setShowBraintree}
      form={form}
    />
  ) : (
    <button
      onClick={() => setShowBraintree(true)}
      className="bg-green-600 px-6 py-2 rounded-lg mt-6"
    >
      Load Braintree
    </button>
  );
}
