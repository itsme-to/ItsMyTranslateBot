import Event from "../../../services/events/event.js";
import { ActivityType, Events } from 'discord.js';
import { Manager } from "../../../manager.js";
import Utils from "../../../utils/index.js";

export default class ClientReadyEvent extends Event {
  name = Events.ClientReady;
  once = true;

  public async execute(client: Manager) {
    await this.client.service.command?.deployCommands();

    client.user?.setPresence({
      activities: [{
        name: 'with the API',
        type: ActivityType.Custom
      }],
      status: 'online'
    });

    const presence = this.client.configs.config.getSubsection("presence");
    const activities = presence.getSubsections("activities");
    const status = Utils.getPresenceStatus(presence.getString("status"))
    let currentIndex = 0;

    if (status) this.client.user.setStatus(status);
    else {
      client.logger.warn(`The status "${status}" is not valid. Must be one of "invisible", "dnd", "idle" or "online".`);
      this.client.user.setStatus("online");
    }

    await this.client.application.entitlements.createTest({ sku: "1260276010776133782", user: "249509545661956096" })

    async function updateActivity(client: Manager) {
      if (currentIndex >= activities.length) currentIndex = 0;
      const activity = activities[currentIndex];
      const text = await Utils.applyVariables(activity.getString("text"), []);

      if (!text) return client.logger.warn(`Activity text is empty. Skipping...`);

      const type = Utils.getActivityType(activity.getString("type"));
      client.user.setActivity(text, { type: type });

      currentIndex++;
    };

    updateActivity(client);
    setInterval(() => updateActivity(client), presence.getNumber("interval") * 1000);
  }
}