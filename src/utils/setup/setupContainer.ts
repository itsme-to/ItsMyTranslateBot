import Utils from '../../utils/index.js';
import { Config } from '../../components/index.js';
import { Variable } from '../../interfaces/index.js';
import { ContainerBuilder, ContainerComponentBuilder } from 'discord.js';

export async function setupContainer(config: Config, variables: Variable[] = [])  {
  const colorString = config.getStringOrNull("color", true);
  const color = colorString ? parseInt(colorString.replace(/^#/, ''), 16) : undefined;

  const container = new ContainerBuilder()
    .setSpoiler(config.getBoolOrNull("spoiler") || false)

  if (color) container.setAccentColor(color);

  for (const componentConfig of config.getSubsections("components")) {
    const components = await Utils.setupComponent<ContainerComponentBuilder>(componentConfig, variables);
    if (components?.length) container.components.push(...components);
  }

  return container
}