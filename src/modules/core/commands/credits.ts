import { ChatInputCommandInteraction, InteractionContextType, } from "discord.js";
import Command from "../../../services/commands/command.js"
import { CommandBuilder } from "../../../builders/index.js";
import Utils from "../../../utils/index.js";
import { User } from "../../../services/users/user.model.js";

export default class GiveCommand extends Command {
  public build() {
    return new CommandBuilder()
      .setName('credits')
      .setDescription('Check your or another user\'s credits')
      .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
      .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to inspect credits for')
          .setRequired(false))
  }

  public async execute(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    let target = interaction.options.getUser("user")

    if (!(interaction.user.id === '249509545661956096') && target) {
      return interaction.reply(await Utils.setupMessage(this.client.configs.lang.getSubsection("no-permission"), []));
    }

    if (!target) {
      target = interaction.user;
    }

    const targetUser = await this.client.service.user.findOrCreate(target);
    return interaction.reply(await Utils.setupMessage(this.client.configs.lang.getSubsection("credits"), [
      ...Utils.userVariables(user),
      ...Utils.userVariables(targetUser, 'target')
    ]));
  }
}