import Event from "../../../services/events/event.js";
import { Entitlement, Events } from 'discord.js';

export default class EntitlementCreateEvent extends Event {
  name = Events.EntitlementCreate;

  public async execute(entitlement: Entitlement) {
    await this.client.service.entitlement.consumeEntitlement(entitlement);
  }
}