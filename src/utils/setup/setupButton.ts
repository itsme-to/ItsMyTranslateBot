import { ButtonBuilder, ButtonStyle } from 'discord.js';
import Utils from '../index.js'
import { Variable } from '../../interfaces/index.js';
import { Config } from '../../components/index.js'

/**
 * Setup a button with the given settings
 */
export async function setupButton(config: Config, variables: Variable[] = []) {
  let style = config.getStringOrNull("style", true);
  let customId = config.getStringOrNull("custom-id", true);
  const disabled = config.getBoolOrNull("disabled") || false;
  let label = config.getStringOrNull("label", true);
  let emoji = config.getStringOrNull("emoji", true);
  let url = config.getStringOrNull("url", true);

  style = await Utils.applyVariables(style, variables);
  customId = await Utils.applyVariables(customId, variables);
  label = await Utils.applyVariables(label, variables);
  emoji = await Utils.applyVariables(emoji, variables);
  url = await Utils.applyVariables(url, variables);

  const button = new ButtonBuilder()
    .setDisabled(disabled);

  if (url) {
    if (!Utils.isValidURL(url)) {
      button.setStyle(ButtonStyle.Danger);
      button.setLabel("Invalid URL");
      button.setCustomId(`invalid-url--${Math.floor(Math.random() * 10000000)}`);
      button.setDisabled(true);

      return button;
    }

    button.setStyle(ButtonStyle.Link);
    button.setURL(url);
  } else {
    button.setStyle(Utils.getButtonStyle(style) || ButtonStyle.Primary);
    button.setCustomId(customId);
  }

  if (label) button.setLabel(label);
  if (emoji) button.setEmoji(emoji);

  return button;
}
