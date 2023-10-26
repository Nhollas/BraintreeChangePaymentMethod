import { NextResponse } from "next/server";
import braintree from "braintree";
import { env } from "@/lib/env";

type ChangeCustomerCard = {
  nonce: string;
  deviceData: string;
};

export async function PUT(request: Request) {
  const body = (await request.json()) as ChangeCustomerCard;

  const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: env.BRAINTREE_MERCHANT_ID,
    publicKey: env.BRAINTREE_PUBLIC_KEY,
    privateKey: env.BRAINTREE_PRIVATE_KEY,
  });

  console.log("Body", body);

  const card = await gateway.paymentMethod.create({
    customerId: env.BRAINTREE_CUSTOMER_ID,
    paymentMethodNonce: body.nonce,
    deviceData: body.deviceData,
    options: {
      makeDefault: true,
    },
  });

  return NextResponse.json(card);
}
