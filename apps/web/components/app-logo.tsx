import { Link } from "@/i18n/navigation";

export function AppLogo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-4 transition-transform hover:scale-[1.02] ${className}`}>
      <img src="/logomark.svg" alt="" className="w-10 h-10 invert dark:invert-0" />
      <span className="text-lg font-display font-bold tracking-tight leading-none">WowGuilds</span>
    </Link>
  );
}
