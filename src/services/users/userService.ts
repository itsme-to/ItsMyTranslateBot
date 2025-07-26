import { User as DiscordUser } from 'discord.js';
import { User } from './user.model.js';
import { Service } from '../../interfaces/index.js';

/**
 * Service to manage users in the bot.
 * Users are used to store information about Discord users.
 */
export default class UserService extends Service {

  async findOrNull(userId: string): Promise<User | null> {
    return User.findOne({ where: { id: userId } });
  }

  async find(userId: string): Promise<User> {
    const user = await this.findOrNull(userId);
    if (!user) throw new Error("User not found");
    return user;
  }

  async findOrCreate(discordUser: DiscordUser): Promise<User> {
    const user = await this.findOrNull(discordUser.id);
    if (user) return this.updateInfo(user, discordUser);

    const userData = {
      id: discordUser.id,
      username: discordUser.username,
      displayName: discordUser.displayName || discordUser.globalName || discordUser.username,
      avatar: discordUser.displayAvatarURL(),
      createdAt: Math.round(discordUser.createdTimestamp / 1000)
    };

    return User.create(userData);
  }

  async updateInfo(user: User, discordUser: DiscordUser): Promise<User> {
    const userData = {
      username: discordUser.username,
      displayName: discordUser.displayName,
      avatar: discordUser.displayAvatarURL(),
    };

    await user.update(userData);
    await user.save();
    return user;
  }
}
