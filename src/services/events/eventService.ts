import { Service } from '../../interfaces/index.js';
import { Collection } from 'discord.js';
import Event from './event.js';
import { Logger } from '../../components/index.js';
import { join, resolve } from 'path';
import { sync } from "glob";

export default class EventService extends Service {
  public events = new Collection<string, EventExecutor>();

  async initialize() {
    this.client.logger.info('EventService initialized!');

    const files = sync(join(resolve(), 'dist/modules/**/events/**/*.js'));

    for (const file of files) {
      const eventPath = new URL('file://' + file.replace(/\\/g, '/')).href;
      const { default: EventClass } = await import(eventPath);

      await this.registerEvent(new EventClass(this.client));
    }
  }

  async registerEvent(event: Event) {
    try {
      if (!this.events.has(event.name)) {
        this.events.set(event.name, new EventExecutor(this.client.logger, event.once || false));
      }
      this.events.get(event.name)?.addEvent(event);
    } catch (e: any) {
      this.client.logger.error(`Error initializing event '${Event.name}'`, e.stack);
    }
  }

  initializeEvents() {
    for (const [name, executor] of this.events) {
      if (executor.once) {
        this.client.once(name, async (...args) => {
          await executor.run(...args);
        });
      } else {
        this.client.on(name, async (...args) => {
          await executor.run(...args);
        });
      }
    }
  }
}

class EventExecutor {
  events: Event[] = [];
  logger: Logger;
  once: boolean;

  constructor(logger: Logger, once: boolean) {
    this.logger = logger;
    this.once = once;
  }

  public addEvent(event: Event) {
    this.events.push(event);
    this.events.sort((a, b) => a.priority - b.priority);
  }

  public async run(...args: any[]) {
    let i: number = 0;
    try {
      while (i < this.events.length) {
        await this.events[i].execute(...args);
        i++;
      }
    } catch (e: any) {
      this.logger.error('Error executing events', e.stack);
    }
  }
}
