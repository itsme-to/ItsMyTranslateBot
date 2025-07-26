import { TextDisplayBuilder } from 'discord.js';
import { Config } from '../../components/index.js';
import { Variable } from '../../interfaces/index.js';
import Utils from '../index.js';

export async function setupTextDisplay(config: Config, variables: Variable[] = [])  {
  const textDisplay = new TextDisplayBuilder()
    .setContent(await Utils.applyVariables(config.getString('content', true), variables))

  return textDisplay
}