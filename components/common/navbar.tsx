"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await authClient.signOut();
      router.refresh();
      router.push("/");
    } catch (error) {
      // Intentionally swallow; a toast system can be wired later
      console.error(error);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        <div className="flex items-center gap-8 w-full">
          <Link href="/" className="flex items-center select-none">
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-gray-900">zo</span>
              <span className="text-red-500">mcp</span>
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-2">
            <Link
              href="/orders"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              Orders
            </Link>
            <Button
              variant="destructive"
              className="h-9 px-4 rounded-md"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}


