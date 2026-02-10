"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Search, Loader2, Globe, Command, X, History, ArrowRight } from "lucide-react";

interface Realm {
  name: string;
  slug: string;
}

interface GuildSuggestion {
  id: string;
  name: string;
  realm: string;
  region: string;
  memberCount: number;
}

interface RecentSearch {
  id: string;
  name: string;
  realm: string;
  region: string;
}

export function GuildSearch() {
  const t = useTranslations("home");
  const router = useRouter();

  const [guildName, setGuildName] = useState("");
  const [realm, setRealm] = useState("");
  const [region, setRegion] = useState("eu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Region dropdown
  const [regionOpen, setRegionOpen] = useState(false);
  const regionBtnRef = useRef<HTMLButtonElement>(null);
  const [regionMenuPos, setRegionMenuPos] = useState({ top: 0, left: 0 });

  const regions = [
    { id: "eu", label: "Europe", flag: "🇪🇺" },
    { id: "us", label: "Americas", flag: "🇺🇸" },
    { id: "kr", label: "Korea", flag: "🇰🇷" },
    { id: "tw", label: "Taiwan", flag: "🇹🇼" },
    { id: "cn", label: "China", flag: "🇨🇳" },
  ];

  const updateRegionMenuPos = () => {
    if (regionBtnRef.current) {
      const rect = regionBtnRef.current.getBoundingClientRect();
      setRegionMenuPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 160, // Align to right
      });
    }
  };

  const popularGuilds: RecentSearch[] = [
    { id: "cm70m6atn0001oaxic6l6491z", name: "Echo", realm: "Tarren Mill", region: "eu" },
    { id: "cm70m6atn0002oaxic6l6491z", name: "Method", realm: "Tarren Mill", region: "eu" },
    { id: "cm70m6atn0003oaxic6l6491z", name: "Liquid", realm: "Illidan", region: "us" },
  ];

  // Realm autocomplete
  const [realms, setRealms] = useState<Realm[]>([]);
  const [realmOpen, setRealmOpen] = useState(false);
  const [realmFiltered, setRealmFiltered] = useState<Realm[]>([]);
  const realmRef = useRef<HTMLDivElement>(null);
  const guildInputRef = useRef<HTMLInputElement>(null);

  // Guild suggestions
  const [suggestions, setSuggestions] = useState<GuildSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load recent searches
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("recent_guild_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  const addToRecent = (guild: RecentSearch) => {
    const updated = [guild, ...recentSearches.filter(s => s.id !== guild.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_guild_searches", JSON.stringify(updated));
  };

  const removeRecent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s.id !== id);
    setRecentSearches(updated);
    localStorage.setItem("recent_guild_searches", JSON.stringify(updated));
  };

  useEffect(() => {
    if (regionOpen) {
      window.addEventListener("scroll", updateRegionMenuPos, true);
      window.addEventListener("resize", updateRegionMenuPos);
    }
    return () => {
      window.removeEventListener("scroll", updateRegionMenuPos, true);
      window.removeEventListener("resize", updateRegionMenuPos);
    };
  }, [regionOpen]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        guildInputRef.current?.focus();
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        guildInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch realms when region changes
  useEffect(() => {
    fetch(`/api/realms?region=${region}`)
      .then((r) => r.json())
      .then((data: Realm[]) => setRealms(data))
      .catch(() => setRealms([]));
  }, [region]);

  // Filter realms as user types
  useEffect(() => {
    if (!realm) {
      setRealmFiltered(realms.slice(0, 8));
    } else {
      const q = realm.toLowerCase();
      setRealmFiltered(
        realms.filter((r) => r.name.toLowerCase().includes(q) || r.slug.includes(q)).slice(0, 8)
      );
    }
  }, [realm, realms]);

  // Fetch guild suggestions (debounced)
  const fetchSuggestions = useCallback(
    (name: string, realmSlug: string, reg: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (name.length < 2) {
        setSuggestions([]);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        try {
          const params = new URLSearchParams({ q: name, region: reg });
          if (realmSlug) params.set("realm", realmSlug);
          const res = await fetch(`/api/guilds/search?${params}`);
          const data: GuildSuggestion[] = await res.json();
          setSuggestions(data);
          setSuggestionsOpen(data.length > 0);
        } catch {
          setSuggestions([]);
        }
      }, 300);
    },
    []
  );

  useEffect(() => {
    fetchSuggestions(guildName, realm, region);
  }, [guildName, realm, region, fetchSuggestions]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (realmRef.current && !realmRef.current.contains(e.target as Node)) {
        setRealmOpen(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
      if (regionBtnRef.current && !regionBtnRef.current.contains(e.target as Node)) {
        setRegionOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectRealm(r: Realm) {
    setRealm(r.slug);
    setRealmOpen(false);
  }

  function selectSuggestion(g: GuildSuggestion | RecentSearch) {
    setSuggestionsOpen(false);
    addToRecent({ id: g.id, name: g.name, realm: g.realm, region: g.region });
    router.push(`/g/${g.id}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guildName.trim() || !realm.trim()) return;

    setLoading(true);
    setError("");
    setSuggestionsOpen(false);

    try {
      const res = await fetch("/api/guilds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: guildName.trim(),
          realm: realm.trim().toLowerCase(),
          region,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        return;
      }

      const guild = await res.json();
      addToRecent({ id: guild.id, name: guild.name, realm: guild.realm, region: guild.region });
      router.push(`/g/${guild.id}`);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 w-full max-w-2xl relative">
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center bg-[var(--bg-tertiary)] border-2 ${
          isFocused ? "border-accent ring-4 ring-accent/10 shadow-2xl scale-[1.01]" : "border-[var(--border)] shadow-xl"
        } rounded-3xl p-1.5 transition-all duration-300 ease-out group`}
      >
        <div className="flex items-center gap-3 pl-4 flex-1 min-w-0">
          <Search className={`w-5 h-5 transition-colors duration-300 ${isFocused ? "text-accent" : "text-[var(--text-secondary)]"}`} />

          {/* Guild name input + suggestions */}
          <div ref={suggestionsRef} className="flex-1 relative min-w-0">
            <input
              ref={guildInputRef}
              type="text"
              value={guildName}
              onChange={(e) => {
                setGuildName(e.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setSuggestionsOpen(true);
              }}
              onBlur={() => setIsFocused(false)}
              placeholder={t("guildNamePlaceholder")}
              className="w-full bg-transparent text-base focus:outline-none font-bold placeholder:text-[var(--text-secondary)]/50 placeholder:font-medium h-10"
              required
            />

            {/* Kbd hint */}
            {!isFocused && !guildName && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 opacity-40 pointer-events-none">
                <Command className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">K</span>
              </div>
            )}

            {(suggestionsOpen && (suggestions.length > 0 || ((recentSearches.length > 0 || popularGuilds.length > 0) && !guildName))) && (
              <div className="absolute left-[-56px] right-[-140px] top-[calc(100%+12px)] bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border)] rounded-3xl shadow-2xl z-50 overflow-hidden transition-all duration-200 ease-out">
                {!guildName && (
                  <div className="p-2 border-b border-[var(--border)] bg-[var(--bg-tertiary)]/50">
                    <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2">
                      {recentSearches.length > 0 ? (
                        <>
                          <History className="w-3 h-3" />
                          Recent Searches
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-3 h-3" />
                          Trending Guilds
                        </>
                      )}
                    </p>
                  </div>
                )}

                <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
                  {!guildName && (recentSearches.length > 0 ? recentSearches : popularGuilds).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectSuggestion(s)}
                      className="w-full text-left px-4 py-3 hover:bg-accent hover:text-white rounded-2xl transition-all flex items-center justify-between group/item"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] group-hover/item:bg-white/20 flex items-center justify-center font-bold text-xs uppercase transition-colors">
                          {s.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{s.name}</p>
                          <p className="text-[10px] opacity-70 font-medium">
                            {s.realm} — {s.region.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-all translate-x-[-4px] group-hover/item:translate-x-0" />
                        {recentSearches.some(rs => rs.id === s.id) && (
                          <button
                            onClick={(e) => removeRecent(e, s.id)}
                            className="p-1.5 rounded-md hover:bg-black/10 text-white/50 hover:text-white transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </button>
                  ))}

                  {guildName && suggestions.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => selectSuggestion(g)}
                      className="w-full text-left px-4 py-3 hover:bg-accent hover:text-white rounded-2xl transition-all flex items-center justify-between group/item"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] group-hover/item:bg-white/20 flex items-center justify-center font-bold text-xs uppercase transition-colors">
                          {g.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{g.name}</p>
                          <p className="text-[10px] opacity-70 font-medium truncate">
                            {g.realm} — {g.region.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono opacity-50 font-bold group-hover/item:opacity-80">
                          {g.memberCount} chars
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-all translate-x-[-4px] group-hover/item:translate-x-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-6 bg-[var(--border)] mx-2 shrink-0" />

        {/* Realm input + autocomplete */}
        <div ref={realmRef} className="w-44 relative shrink-0">
          <div className="flex items-center gap-2 pl-2">
            <Globe className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
            <input
              type="text"
              value={realm}
              onChange={(e) => {
                setRealm(e.target.value);
                setRealmOpen(true);
              }}
              onFocus={() => {
                setRealmOpen(true);
                setIsFocused(true);
              }}
              onBlur={() => setIsFocused(false)}
              placeholder={t("realmPlaceholder")}
              className="w-full bg-transparent text-sm focus:outline-none font-bold h-10 placeholder:font-medium"
              required
            />
          </div>
          {realmOpen && realmFiltered.length > 0 && (
            <div className="absolute left-0 top-[calc(100%+12px)] w-64 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border)] rounded-3xl shadow-2xl z-50 overflow-hidden p-2 transition-all duration-200 ease-out">
              <div className="max-h-64 overflow-y-auto space-y-1">
                {realmFiltered.map((r) => (
                  <button
                    key={r.slug}
                    type="button"
                    onClick={() => selectRealm(r)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                      r.slug === realm
                        ? "bg-accent text-white"
                        : "hover:bg-[var(--bg-tertiary)]"
                    }`}
                  >
                    <p className="text-sm font-bold">{r.name}</p>
                    <p className={`text-[10px] font-medium ${r.slug === realm ? "text-white/70" : "text-[var(--text-secondary)]"}`}>
                      {r.slug}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-[var(--border)] mx-2 shrink-0" />

        {/* Region select */}
        <div className="relative mr-1">
          <button
            ref={regionBtnRef}
            type="button"
            onClick={() => {
              updateRegionMenuPos();
              setRegionOpen(!regionOpen);
            }}
            className={`flex items-center gap-2 px-3 h-10 rounded-2xl transition-all font-black text-[10px] uppercase tracking-wider ${
              regionOpen ? "bg-accent text-white" : "hover:bg-[var(--border)] text-[var(--text-secondary)]"
            }`}
          >
            <span>{regions.find(r => r.id === region)?.flag}</span>
            <span>{region}</span>
            <ArrowRight className={`w-2.5 h-2.5 transition-transform duration-200 ${regionOpen ? "rotate-[-90deg]" : "rotate-90"}`} />
          </button>

          {mounted && regionOpen && createPortal(
            <div
              className="fixed z-[9999] w-40 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-2xl p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              style={{ top: regionMenuPos.top, left: regionMenuPos.left }}
            >
              <div className="px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] border-b border-[var(--border)] mb-1">
                Select Region
              </div>
              {regions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRegion(r.id);
                    setRegionOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group/reg ${
                    region === r.id 
                      ? "bg-accent text-white" 
                      : "hover:bg-[var(--bg-tertiary)] text-[var(--text)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{r.flag}</span>
                    <span className="text-xs font-bold">{r.label}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase opacity-40 group-hover/reg:opacity-100 ${region === r.id ? "text-white opacity-100" : ""}`}>
                    {r.id}
                  </span>
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="h-11 px-6 bg-accent text-white rounded-[1.25rem] font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-accent/20"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{t("searchButton")}</span>
        </button>
      </form>

      {error && (
        <div className="absolute left-0 right-0 -bottom-12 flex justify-center">
          <p className="bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full text-xs font-bold border border-red-500/20 shadow-lg backdrop-blur-md">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
