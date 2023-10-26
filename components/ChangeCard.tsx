"use client";

import { useState } from "react";
import Braintree from "./Braintree";

export default function ChangeCard({ clientToken }: { clientToken: string }) {
  const [showBraintree, setShowBraintree] = useState(false);

  return showBraintree ? (
    <Braintree clientToken={clientToken} hideBraintree={setShowBraintree} />
  ) : (
    <button
      onClick={() => setShowBraintree(true)}
      className="bg-green-600 px-6 py-2 rounded-lg mt-6"
    >
      Load Braintree
    </button>
  );
}
