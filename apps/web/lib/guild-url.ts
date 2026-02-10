export function guildSlug(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
}

export function guildPath(guild: {
  name: string;
  realm: string;
  region: string;
}): string {
  return `/g/${guild.region}/${guild.realm}/${guildSlug(guild.name)}`;
}
