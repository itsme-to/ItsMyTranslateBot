import Event from "../../../services/events/event.js";
import { Events, Message } from 'discord.js';

export default class MessageCreateEvent extends Event {
  name = Events.MessageCreate;

  public async execute(message: Message) {
    if (message.author.bot) return;

    message.reply('Hello World!');
  }
}