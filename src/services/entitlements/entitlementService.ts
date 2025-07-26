import { Entitlement } from 'discord.js';
import { Service } from '../../interfaces/index.js';
import Utils from '../../utils/index.js';

export default class EntitlementService extends Service {

  async initialize() {
    const entitlements = await this.client.application.entitlements.fetch({ excludeDeleted: true });
    await Promise.all(entitlements.map(entitlement => this.consumeEntitlement(entitlement)));
  }

  async consumeEntitlement(entitlement: Entitlement) {
    if (entitlement.consumed === true) return;
    this.client.logger.debug(`Consuming entitlement ${entitlement.id} for user ${entitlement.userId}`);
    let user = await this.client.service.user.findOrNull(entitlement.userId);
    const discordUser = await this.client.users.fetch(entitlement.userId).catch(() => null);
    if (!user) {
      if (!discordUser) {
        this.client.logger.error(`User with ID ${entitlement.userId} not found for entitlement ${entitlement.id}`);
        return;
      }

      user = await this.client.service.user.findOrCreate(discordUser);
    }

    const sku = this.client.configs.config.getSubsections("sku").find(sku => sku.getString("id") === entitlement.skuId);
    if (!sku) {
      this.client.logger.error(`SKU with ID ${entitlement.skuId} not found for entitlement ${entitlement.id}`);
      return;
    }

    await user.addCredits(sku.getNumber("credits"));
    await entitlement.consume()
    if (discordUser) {
      await discordUser.send(await Utils.setupMessage(this.client.configs.lang.getSubsection("entitlement-consumed"), [
        ...Utils.userVariables(user),
        { searchFor: "%sku_name%", replaceWith: sku.getString("name") },
        { searchFor: "%credits%", replaceWith: sku.getNumber("credits").toString() }
      ]));
    }
  }
}
