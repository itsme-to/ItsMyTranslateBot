import { Entitlement } from 'discord.js';
import { Service } from '../../interfaces/index.js';

export default class EntitlementService extends Service {

  async initialize() {
    const entitlements = await this.client.application.entitlements.fetch();
    await Promise.all(entitlements.map(entitlement => this.consumeEntitlement(entitlement)));
  }

  async consumeEntitlement(entitlement: Entitlement) {
    this.client.logger.debug(`Consuming entitlement ${entitlement.id} for user ${entitlement.userId}`);

    let user = await this.client.service.user.find(entitlement.userId);
    if (!user) {
      const discordUser = await this.client.users.fetch(entitlement.userId).catch(() => null);
      if (!discordUser) {
        this.client.logger.error(`User with ID ${entitlement.userId} not found for entitlement ${entitlement.id}`);
        return;
      }

      user = await this.client.service.user.findOrCreate(discordUser);
    }

    const skus: { [key: string]: number } = {
      "1260276010776133782": 100,
      "1260276162639167548": 500,
      "1260276278305751050": 1200
    }

    const sku = skus[entitlement.skuId];
    if (!sku) {
      this.client.logger.error(`SKU with ID ${entitlement.skuId} not found for entitlement ${entitlement.id}`);
      return;
    }

    await user.addCredits(sku);
    await entitlement.consume()
  }
}
