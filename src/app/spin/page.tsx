import { redirect } from "next/navigation";
export default async function SpinRedirect({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const q = await searchParams;
  redirect(q.ref ? `/?ref=${encodeURIComponent(q.ref)}` : "/");
}
