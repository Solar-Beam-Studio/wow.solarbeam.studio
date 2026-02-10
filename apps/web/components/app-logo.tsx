import { Link } from "@/i18n/navigation";

export function AppLogo({
  href = "/",
  className,
  mode = "full",
}: {
  href?: string;
  className?: string;
  mode?: "icon" | "full";
}) {
  if (mode === "icon") {
    return (
      <Link href={href} className={`block transition-transform hover:scale-105 ${className ?? ""}`}>
        <img src="/logomark.svg" alt="WowGuilds" className="w-10 h-10 invert dark:invert-0" />
      </Link>
    );
  }

  return (
    <Link href={href} className={`flex items-center gap-3 transition-transform hover:scale-[1.02] ${className ?? ""}`}>
      <img src="/logomark.svg" alt="" className="w-8 h-8 invert dark:invert-0" />
      <span className="text-2xl font-black tracking-tighter uppercase leading-none">
        WOW<span className="text-violet-500">GUILDS</span>.COM
      </span>
    </Link>
  );
}
