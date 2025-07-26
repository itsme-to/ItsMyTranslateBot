import { Service } from '../../interfaces/index.js';
import { join, resolve } from 'path';
import { sync } from "glob";
import Command from './command.js';
import {
  REST,
  Routes,
  Collection,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  AutocompleteInteraction
} from 'discord.js';

export default class CommandService extends Service {
  public commands = new Collection<string, Command>();

  async initialize() {
    this.client.logger.info('CommandService initialized!');

    const files = sync(join(resolve(), 'dist/modules/**/commands/**/*.js'));

    for (const file of files) {
      const commandPath = new URL('file://' + file.replace(/\\/g, '/')).href;
      const { default: CommandClass } = await import(commandPath);

      await this.registerCommand(new CommandClass(this.client));
    }
  }

  public async registerCommand(command: Command) {
    try {
      if (!this.commands.has(command.builder.name)) {
        this.commands.set(command.builder.name, command);
      }
    } catch (e: any) {
      this.client.logger.error(`Error initializing command '${command.builder.name}'`, e.stack);
    }
  }

  public async deployCommands() {
    const commandData = [...this.commands.values()]
      .map(command => command.builder.toJSON());

    const token = process.env.DISCORD_TOKEN!;
    const rest = new REST().setToken(token);

    try {
      this.client.logger.info('Registering slash commands.');
      await rest.put(Routes.applicationCommands(this.client.user.id), {
        body: commandData,
      });

      this.client.logger.info('Successfully registered slash commands.');
    } catch (e: any) {
      this.client.logger.error(`Error syncing commands to Discord: ${e.message}`, e.stack);
    }
  }

  //dispatch command
  public async dispatchCommand(interaction: ChatInputCommandInteraction<'cached'> | ContextMenuCommandInteraction<'cached'> | AutocompleteInteraction<'cached'>) {
    const command = this.commands.get(interaction.commandName);

    if (!command) {
      this.client.logger.error(`Command not found: ${interaction.commandName}`);
      return;
    }

    try {
      if (interaction.isAutocomplete()) {
        await command.autocomplete(interaction);
      } else {
        await command.execute(interaction);
      }
    } catch (e: any) {
      this.client.logger.error(`Error executing command: ${interaction.commandName}`, e.stack);
    }
  }
}