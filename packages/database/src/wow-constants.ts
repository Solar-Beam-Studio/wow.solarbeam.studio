export const CLASS_COLORS: Record<string, string> = {
  Warrior: "#c79c6e",
  Paladin: "#f58cba",
  Hunter: "#abd473",
  Rogue: "#fff569",
  Priest: "#ffffff",
  "Death Knight": "#c41f3b",
  Shaman: "#0070de",
  Mage: "#69ccf0",
  Warlock: "#9482c9",
  Monk: "#00ff96",
  Druid: "#ff7d0a",
  "Demon Hunter": "#a330c9",
  Evoker: "#33937f",
};

export const CLASS_ID_MAP: Record<number, string> = {
  1: "Warrior",
  2: "Paladin",
  3: "Hunter",
  4: "Rogue",
  5: "Priest",
  6: "Death Knight",
  7: "Shaman",
  8: "Mage",
  9: "Warlock",
  10: "Monk",
  11: "Druid",
  12: "Demon Hunter",
  13: "Evoker",
};

export const RAID_NAMES: Record<string, string> = {
  "nerubar-palace": "Nerub-ar Palace",
  "liberation-of-undermine": "Liberation of Undermine",
  "manaforge-omega": "Manaforge Omega",
  "blackrock-depths": "Blackrock Depths",
};

export const RAID_PRIORITY = [
  "manaforge-omega",
  "liberation-of-undermine",
  "nerubar-palace",
  "blackrock-depths",
];

export function getPvpRatingColor(rating: number): string {
  if (rating >= 2400) return "text-purple-400";
  if (rating >= 2100) return "text-orange-400";
  if (rating >= 1800) return "text-blue-400";
  if (rating >= 1500) return "text-green-400";
  return "text-zinc-400";
}

export function getItemLevelColor(ilvl: number): string {
  if (ilvl >= 650) return "text-purple-400";
  if (ilvl >= 620) return "text-blue-400";
  if (ilvl >= 590) return "text-green-400";
  if (ilvl >= 560) return "text-yellow-400";
  return "text-gray-400";
}

export function getMythicPlusColor(score: number): string {
  if (score >= 3000) return "text-purple-400";
  if (score >= 2500) return "text-orange-400";
  if (score >= 2000) return "text-blue-400";
  if (score >= 1500) return "text-green-400";
  return "text-zinc-400";
}

export function getAchievementColor(points: number): string {
  if (points >= 30000) return "text-purple-400";
  if (points >= 20000) return "text-orange-400";
  if (points >= 15000) return "text-blue-400";
  if (points >= 10000) return "text-green-400";
  return "text-zinc-400";
}

export function getVaultColor(runs: number): string {
  if (runs >= 8) return "text-purple-400";
  if (runs >= 4) return "text-blue-400";
  if (runs >= 1) return "text-green-400";
  return "text-zinc-400";
}
