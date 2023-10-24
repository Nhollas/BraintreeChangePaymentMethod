import Braintree from "@/components/Braintree";
import { getClientToken } from "@/lib/getClientToken";

export default async function Home() {
  const clientToken = await getClientToken();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Braintree clientAuthorization={clientToken} />
    </main>
  );
}
