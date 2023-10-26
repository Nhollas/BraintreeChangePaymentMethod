import braintree from "braintree";
import { env } from "@/lib/env";

export async function getClientToken(): Promise<string> {
  const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: env.BRAINTREE_MERCHANT_ID,
    publicKey: env.BRAINTREE_PUBLIC_KEY,
    privateKey: env.BRAINTREE_PRIVATE_KEY,
  });

  const response = await gateway.clientToken.generate({
    customerId: env.BRAINTREE_CUSTOMER_ID,
  });

  const clientToken = response.clientToken;

  return clientToken;
}
