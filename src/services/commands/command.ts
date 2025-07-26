import { Manager } from "../../manager.js";
import { CommandBuilder } from "../../builders/index.js";
import { AutocompleteInteraction, CommandInteraction, ContextMenuCommandBuilder } from "discord.js";
import { User } from "../users/user.model.js";

export default abstract class Command {
  protected client: Manager;
  public builder: CommandBuilder | ContextMenuCommandBuilder;

  constructor(client: Manager) {
    this.client = client;
    this.builder = this.build()
  }

  public abstract build(): CommandBuilder | ContextMenuCommandBuilder;


  public async autocomplete(interaction: AutocompleteInteraction<'cached'>): Promise<void | any> {
    throw new Error('Method not implemented.');
  }

  public async execute(interaction: CommandInteraction<'cached'>, user: User): Promise<void | any> {
    throw new Error('Method not implemented.');
  }
}