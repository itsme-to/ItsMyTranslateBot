import { ApplicationIntegrationType, CommandInteraction, InteractionContextType, SlashCommandBuilder } from "discord.js";
import Command from "../../../services/commands/command.js"


export default class testCommand extends Command {
  public build() {
    return new SlashCommandBuilder()
      .setName('test')
      .setDescription('A test command')
      .setIntegrationTypes([ApplicationIntegrationType.UserInstall])
      .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel]);
  }

  public async execute(interaction: CommandInteraction) {
    await interaction.reply('Test command executed!');
  }
}