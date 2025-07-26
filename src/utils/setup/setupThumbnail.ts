import { ThumbnailBuilder } from 'discord.js';
import { Config } from '../../components/index.js';
import { Variable } from '../../interfaces/index.js';
import Utils from '../index.js';

export async function setupThumbnail(config: Config, variables: Variable[] = [])  {
  const description = await Utils.applyVariables(config.getStringOrNull('description', true), variables)

  const thumbnail = new ThumbnailBuilder()
    .setSpoiler(config.getBoolOrNull('spoiler') || false)
    .setURL(await Utils.applyVariables(config.getString('url', true), variables))

  if (description) thumbnail.setDescription(description)

  return thumbnail
}