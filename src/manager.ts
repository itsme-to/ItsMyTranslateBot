import { Client } from 'discord.js';
import { BaseConfig, Logger } from './components/index.js';
import EventService from './services/events/eventService.js';
import CommandService from './services/commands/commandService.js';
import { Sequelize } from 'sequelize-typescript';
import { sync } from 'glob';
import { join } from 'path';
import UserService from './services/users/userService.js';

interface Services {
  event: EventService
  command: CommandService
  user: UserService
}

export class Manager extends Client<true> {
  public service: Services = {} as Services;
  public database!: Sequelize;
  public logger: Logger = new Logger();
  public configs = {
    config: new BaseConfig("configs/config", "configs/config.yml")
  };

  async initialize() {
    this.logger.info('Initializing...');

    await this.configs.config.initialize();

    await this.initializeDatabase();
    this.logger.info('Database initialized!');
    
    this.service.event = new EventService(this);
    await this.service.event.initialize();

    this.service.command = new CommandService(this);
    this.service.user = new UserService(this);
    await this.service.command.initialize();

    this.service.event.initializeEvents();
    await this.loadDatabaseModels();
    this.logger.info('Database models loaded!');

    this.login(process.env.DISCORD_TOKEN);
  }


  private async initializeDatabase() {
    this.logger.info('Initializing database...');

    const username = process.env.MYSQL_DATABASE_USER || '';
    const password = process.env.MYSQL_DATABASE_PASSWORD || '';
    const databaseName = process.env.MYSQL_DATABASE_NAME || '';
    const host = process.env.MYSQL_DATABASE_HOST || '';
    const port = process.env.MYSQL_DATABASE_PORT || '';

    this.database = new Sequelize(
      databaseName,
      username,
      password,
      {
        host: host,
        port: port ? parseInt(port) : undefined,
        dialect: 'mysql',
        logging: false
      });

    try {
      await this.database.authenticate();
      this.logger.info('Connection has been established successfully with database.');
    } catch (error) {
      this.logger.error('Unable to connect to the database:', error);
      process.exit(1);
    }
  }

  private async loadDatabaseModels() {
    const models = sync(join('..', '*.models.js').replace(/\\/g, '/'));

    for (const model of models) {
      const modelUrl = new URL('file://' + model.replace(/\\/g, '/')).href;
      const { default: Model } = await import(modelUrl);

      this.database.addModels([Model]);
      await Model.sync({ alter: true });
    }
  }
}
