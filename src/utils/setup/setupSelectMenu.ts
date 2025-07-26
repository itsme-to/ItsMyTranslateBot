import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import Utils from '../index.js';
import { Variable } from '../../interfaces/index.js';
import { Config } from '../../components/index.js';
/**
 * Setup a select menu with the given settings
 */
export async function setupSelectMenu(config: Config, variables: Variable[] = []) {
  const customId = config.getStringOrNull("custom-id");
  const disabled = config.getBoolOrNull("disabled") || false;

  const placeholder = config.getStringOrNull("placeholder");
  const minSelect = config.getNumberOrNull("min-values") || 0;
  const maxSelect = config.getNumberOrNull("max-values") || 1;
  const options = config.getSubsections("options");

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId || 'undefined')
    .setDisabled(disabled)
    .setMinValues(minSelect)

  const placeholderValue = await Utils.applyVariables(placeholder, variables);
  if (placeholderValue) selectMenu.setPlaceholder(placeholderValue);

  for (const option of options) {
    const optionData = await setupOption(option, variables);
    if (!optionData) continue;

    selectMenu.addOptions(optionData);
  }

  if (!selectMenu.options.length) return

  if (maxSelect > selectMenu.options.length) {
    selectMenu.setMaxValues(selectMenu.options.length);
  } else {
    selectMenu.setMaxValues(maxSelect);
  }

  return selectMenu;
}


async function setupOption(
  config: Config,
  variables: Variable[]
) {
  const label = await Utils.applyVariables(config.getString("label"), variables)
  const value = await Utils.applyVariables(config.getString("value"), variables)
  const emoji = await Utils.applyVariables(config.getStringOrNull("emoji"), variables);
  const defaultOption = await Utils.applyVariables(config.getStringOrNull("default"), variables);
  const description = await Utils.applyVariables(config.getStringOrNull("description"), variables);

  let condition = await Utils.applyVariables(config.getStringOrNull('condition'), variables);
  if (condition) {
    const isMet = Utils.evaluateBoolean(condition);
    if (!isMet) return
  }
  
  const option = new StringSelectMenuOptionBuilder()
    .setLabel(label)
    .setValue(value);

  try {
    option.setDefault(Utils.evaluateBoolean(defaultOption) || false);
  } catch (error) { }

  if (emoji && Utils.isValidEmoji(emoji)) option.setEmoji(emoji);
  if (description) option.setDescription(description);

  return option;
}