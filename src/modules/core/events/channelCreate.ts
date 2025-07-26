import Event from "../../../services/events/event.js";
import { Events, User } from 'discord.js';

export default class MessageCreateEvent extends Event {
  name = Events.UserUpdate;

  public async execute(oldUser: User, newUser: User) {
    console.log(`Channel created: ${newUser.id}`);
  }
}