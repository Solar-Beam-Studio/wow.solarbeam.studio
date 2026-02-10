"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton() {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white border border-white/10 hover:border-white/20 transition-all"
    >
      <Share2 className="w-3 h-3" />
      Share
    </button>
  );
}
