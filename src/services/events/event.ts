import { Manager } from "../../manager.js";
import { Events } from 'discord.js';

export default class Event {
  protected client: Manager
  public name: Events = Events.ClientReady;
  public once: boolean = false;
  public priority: number = 5;

  constructor(client: Manager) {
    this.client = client;
  }

  public async execute(...args: any) {
    throw new Error('Method not implemented.');
  }
}