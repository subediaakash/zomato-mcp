import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/common/navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "zomcp",
  description: "A Zomato-inspired ordering UI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/signin");
  }
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
