import { Link } from "@/i18n/navigation";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-black tracking-tighter uppercase">
            WOW<span className="text-violet-500">GUILDS</span>.COM
          </Link>
          <span className="text-[10px] text-gray-600">
            &copy; {new Date().getFullYear()} All rights reserved
          </span>
        </div>

        <div className="flex items-center gap-6 text-[11px] text-gray-500">
          <Link
            href="/faq"
            className="hover:text-white transition-colors"
          >
            FAQ
          </Link>
          <a
            href="https://worldofwarcraft.blizzard.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Blizzard
          </a>
          <a
            href="https://raider.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Raider.IO
          </a>
          <span className="text-gray-700">
            Not affiliated with Blizzard Entertainment
          </span>
        </div>
      </div>
    </footer>
  );
}
