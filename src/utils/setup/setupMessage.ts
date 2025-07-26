import { MessageFlags } from 'discord.js';
import Utils from '../index.js';
import { Config } from '../../components/index.js';
import { Variable, TopLevelComponentBuilder, MessageOutput } from '../../interfaces/index.js';

export async function setupMessage(config: Config, variables: Variable[], rawComponents: any = []): Promise<MessageOutput> {
  const message: MessageOutput = {
    components: [],
    poll: undefined,
    allowedMentions: { parse: [] },
    files: [],
  };

  const flags = []

  const ephemeral = config.getBoolOrNull("ephemeral") || false;
  if (ephemeral) {
    flags.push(MessageFlags.Ephemeral);
  }
  
  const disableMentions = config.getBoolOrNull("disable-mentions") || false;
  if (disableMentions) message.allowedMentions = { parse: [] }

  if (flags) {
    message.flags = flags.reduce((acc: number, flag: number) => acc | flag, 0);
  }

  const files = config.getStringsOrNull("files") || [];
  for (const file of files) {
    message.files.push(await Utils.applyVariables(file, variables));
  }

  const componentsConfig = config.getSubsections("components");
  const components = []
  for (const componentConfig of componentsConfig) {
    const component = await Utils.setupComponent<TopLevelComponentBuilder>(componentConfig, variables);
    if (component?.length) components.push(...component);
  }

  if (rawComponents.length) components.push(...rawComponents);

  message.components.push(...components);
  message.flags |= MessageFlags.IsComponentsV2;

  return message;
};
