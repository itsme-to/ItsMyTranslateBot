import Event from "../../../services/events/event.js";
import { Entitlement, Events } from 'discord.js';

export default class EntitlementCreateEvent extends Event {
  name = Events.EntitlementCreate;

  public async execute(entitlement: Entitlement) {
    console.log(entitlement)

    const skus: { [key: string]: number } = {
        "1260276010776133782": 100,
        "1260276162639167548": 500,
        "1260276278305751050": 700
    }

    const sku = skus[entitlement.skuId]
    const user = await this.client.service.user.find(entitlement.userId);
    if (!user) {
      this.client.logger.error(`User with ID ${entitlement.userId} not found for entitlement ${entitlement.id}`);
      return;
    }

    await user.addCredits(sku)
    await entitlement.consume()
  }
}