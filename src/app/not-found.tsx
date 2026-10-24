import Link from "next/link";
import { SearchX } from "lucide-react";
import { Logo } from "@/components/nav";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="max-w-sm rounded-3xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto mb-4 w-fit">
          <Logo size={48} />
        </div>
        <SearchX className="mx-auto size-8 text-ink-3" />
        <h1 className="mt-3 font-display text-2xl">Page not found</h1>
        <p className="mt-1 text-sm font-medium text-ink-2">This story or page doesn&apos;t exist, or its link has changed.</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/" className="btn px-5 py-2.5 text-sm">
            Go to Today
          </Link>
          <Link href="/library" className="btn btn-ghost px-5 py-2.5 text-sm">
            Search the library
          </Link>
        </div>
      </div>
    </div>
  );
}
