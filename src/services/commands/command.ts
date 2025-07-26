import { Manager } from "../../manager.js";
import { AutocompleteInteraction, CommandInteraction, ContextMenuCommandBuilder, SlashCommandBuilder } from "discord.js";

export default abstract class Command {
  protected client: Manager;
  public builder: SlashCommandBuilder | ContextMenuCommandBuilder;

  constructor(client: Manager) {
    this.client = client;
    this.builder = this.build()
  }

  public abstract build(): SlashCommandBuilder | ContextMenuCommandBuilder;


  public async autocomplete(interaction: AutocompleteInteraction<'cached'>): Promise<void | any> {
    throw new Error('Method not implemented.');
  }

  public async execute(interaction: CommandInteraction<'cached'>): Promise<void | any> {
    throw new Error('Method not implemented.');
  }
}