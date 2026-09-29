import HelpCenterClient from "./HelpCenterClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HelpCenterPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f3] text-[#111318]">
      <HelpCenterClient />
    </main>
  );
}