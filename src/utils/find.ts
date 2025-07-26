import { Guild, GuildBasedChannel, TextChannel, Channel, Role } from 'discord.js';
import client from '../index.js';

export async function findRole(identifier: string, guild: Guild): Promise<Role | undefined> {
  const search = String(identifier).toLowerCase();

  if (search.includes(';')) {
    const [guildId, name] = search.split(';', 2);
    const identifierGuild = client.guilds.cache.get(guildId);

    if (identifierGuild) return rawFindRole(name, identifierGuild);
  }

  return rawFindRole(search, guild);
}

async function rawFindRole(identifier: string, guild: Guild): Promise<Role | undefined> {
  if (identifier === 'everyone' || identifier === '@everyone') return guild.roles.everyone;

  const role = guild.roles.cache.find(r => r.name.toLowerCase() === identifier || r.id === identifier);

  return role;
}

export async function findChannel(identifier: string, guild: Guild): Promise<GuildBasedChannel | undefined> {
  const search = String(identifier)

  if (search.includes(';')) {
    const [guildId, name] = search.split(';', 2);
    const identifierGuild = client.guilds.cache.get(guildId);

    if (identifierGuild) return rawFindChannel(name, identifierGuild);
  }

  return rawFindChannel(search, guild);
}

function isGuildTextBasedChannel(channel?: Channel): channel is TextChannel {
  return channel && channel.isTextBased() && !channel.isDMBased() || false
}

export async function findTextChannel(identifier: string, guild: Guild): Promise<TextChannel | undefined> {
  const channel = await findChannel(identifier, guild);

  if (isGuildTextBasedChannel(channel)) return channel;

  return undefined;
}

async function rawFindChannel(identifier: string, guild: Guild): Promise<GuildBasedChannel | undefined> {
  const channel = guild.channels.cache.find(c => c.name === identifier || c.id === identifier);

  return channel;
}
