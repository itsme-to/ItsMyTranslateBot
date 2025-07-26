import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import Utils from '../index.js';
import { Config } from '../../components/index.js';
import { Variable } from '../../interfaces/index.js'; 

export async function setupModal(config: Config, variables: Variable[] = []) {

  let customId = config.getString("custom-id");
  let title = config.getString("title", true)

  customId = await Utils.applyVariables(customId, variables);
  if (!customId) throw new Error(`Custom ID is required for a modal.`);

  title = await Utils.applyVariables(title, variables);

  const modal = new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title);

  const components: Config[] = config.getSubsections("components");
  for (const component of components) {

    let cCustomId = component.getString("id");
    let cLabel = component.getString("label", true);
    let cPlaceholder = component.getStringOrNull("placeholder", true) || '';
    const cRequired = component.getBoolOrNull("required") || false;
    let cMaxLength = component.getStringOrNull("max-length") || "1000";
    let cValue = component.getStringOrNull("value", true) || '';
    const cStyle = component.getStringOrNull("style");

    cCustomId = await Utils.applyVariables(cCustomId, variables);
    cLabel = await Utils.applyVariables(cLabel, variables);
    cPlaceholder = await Utils.applyVariables(cPlaceholder, variables);
    cMaxLength = await Utils.applyVariables(cMaxLength, variables);
    cValue = await Utils.applyVariables(cValue, variables);

    const row = new ActionRowBuilder<TextInputBuilder>()
      .addComponents(
        new TextInputBuilder()
          .setCustomId(cCustomId)
          .setLabel(cLabel)
          .setPlaceholder(cPlaceholder || "")
          .setRequired(cRequired)
          .setMaxLength(parseInt(cMaxLength) || 1000)
          .setValue(cValue || "")
          .setStyle((cStyle ? Utils.getTextInputStyle(cStyle) || TextInputStyle.Short : TextInputStyle.Short))
      );
    modal.addComponents(row);
  }

  return modal;
}
