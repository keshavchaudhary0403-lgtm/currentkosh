import Link from "next/link";
import { Logo } from "@/components/nav";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="rise card max-w-md p-8 text-center sm:p-10">
        <div className="mx-auto mb-6 w-fit">
          <Logo size={52} />
        </div>
        <div className="font-display text-[96px] leading-none italic">404</div>
        <h1 className="mt-3 text-xl font-semibold">Page not found</h1>
        <p className="mt-1.5 text-sm text-ink-2">This story or page doesn&apos;t exist, or its link has changed.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn px-5 text-[15px]">
            Go to Today
          </Link>
          <Link href="/library" className="btn btn-ghost px-5 text-[15px]">
            Search the library
          </Link>
        </div>
      </div>
    </div>
  );
}
