import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, } from "discord.js";
import Command from "../../../services/commands/command.js"
import { CommandBuilder } from "../../../builders/index.js";
import Utils from "../../../utils/index.js";
import { User } from "../../../services/users/user.model.js";

export default class GiveCommand extends Command {
  public build() {
    return new CommandBuilder()
      .setName('give')
      .setGuilds(['935421560355946596'])
      .setDescription('Give credits to a user')
      .setContexts([InteractionContextType.Guild])
      .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to give credit to')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('amount')
          .setDescription('The amount of credit to give')
          .setRequired(true)
          .setMinValue(1))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  }

  public async execute(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    if (!(interaction.user.id === '249509545661956096')) {
      return interaction.reply(await Utils.setupMessage(this.client.configs.lang.getSubsection("no-permission"), []));
    }

    const target = interaction.options.getUser("user", true);
    const amount = interaction.options.getInteger("amount", true);

    const targetUser = await this.client.service.user.findOrCreate(target);
    await targetUser.addCredits(amount);

    return interaction.reply(await Utils.setupMessage(this.client.configs.lang.getSubsection("give-credits"), [
      ...Utils.userVariables(user),
      ...Utils.userVariables(targetUser, 'target'),
      { searchFor: "%amount%", replaceWith: amount.toString() }
    ]));
  }
}