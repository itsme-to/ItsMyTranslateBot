import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandAttachmentOption, SlashCommandChannelOption, SlashCommandBooleanOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandUserOption } from 'discord.js';

export class CommandBuilder extends SlashCommandBuilder {
  public guilds : Array<string> = [];

  public setGuilds(guilds: Array<string>) {
    this.guilds = guilds;
    return this;
  }

    public override addStringOption(input: SlashCommandStringOption | ((builder: SlashCommandStringOption) => SlashCommandStringOption)): this {
    super.addStringOption(input);
    return this;
  }

  public override addAttachmentOption(input: SlashCommandAttachmentOption | ((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption)): this {
    super.addAttachmentOption(input);
    return this;
  }

  public override addChannelOption(input: SlashCommandChannelOption | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption)): this {
    super.addChannelOption(input);
    return this;
  }

  public override addBooleanOption(input: SlashCommandBooleanOption | ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)): this {
    super.addBooleanOption(input);
    return this;
  }

  public override addIntegerOption(input: SlashCommandIntegerOption | ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption)): this {
    super.addIntegerOption(input);
    return this;
  }

  public override addMentionableOption(input: SlashCommandMentionableOption | ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption)): this {
    super.addMentionableOption(input);
    return this;
  }

  public override addNumberOption(input: SlashCommandNumberOption | ((builder: SlashCommandNumberOption) => SlashCommandNumberOption)): this {
    super.addNumberOption(input);
    return this;
  }

  public override addRoleOption(input: SlashCommandRoleOption | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)): this {
    super.addRoleOption(input);
    return this;
  }

  public override addUserOption(input: SlashCommandUserOption | ((builder: SlashCommandUserOption) => SlashCommandUserOption)): this {
    super.addUserOption(input);
    return this;
  }
}