import Event from "../../../services/events/event.js";
import { Events } from 'discord.js';
import { Interaction } from 'discord.js';

export default class InteractionCreateEvent extends Event {
  name = Events.InteractionCreate;

  public async execute(interaction: Interaction<'cached'>) {
    if (!interaction.isCommand()) return


    if (interaction.isContextMenuCommand() || interaction.isChatInputCommand()) {
      this.client.service.command.dispatchCommand(interaction)
    }
  }
}