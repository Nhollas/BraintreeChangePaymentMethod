import ChangeCard from "@/components/ChangeCard";
import { getClientToken } from "@/lib/getClientToken";

export default async function Home() {
  const clientToken = await getClientToken();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ChangeCard clientToken={clientToken} />
    </main>
  );
}
