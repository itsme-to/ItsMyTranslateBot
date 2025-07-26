import { AttachmentBuilder, ChatInputCommandInteraction, ComponentType, InteractionContextType, } from "discord.js";
import Command from "../../../services/commands/command.js"
import { CommandBuilder } from "../../../builders/index.js";
import Utils from "../../../utils/index.js";
import { User } from "../../../services/users/user.model.js";
import wsClient from '../index.js';

export default class TranslateCommand extends Command {
  public build() {
    return new CommandBuilder()
      .setName('translate')
      .setDescription('Translate file to another language')
      .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
      .addAttachmentOption(option =>
        option.setName('file')
          .setDescription('The file to translate')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('language')
          .setDescription('The language to translate the file to')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('mode')
          .setDescription('The mode of translation')
          .addChoices(
            { name: 'Basic', value: 'basic' },
            { name: 'Advanced', value: 'advanced' },
          )
          .setRequired(false))
  }

  public async execute(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
    const attachment = interaction.options.getAttachment("file", true);
    const language = interaction.options.getString("language", true);
    const mode = interaction.options.getString("mode") || 'basic';

    const acceptedFileTypes = ["application/json", "text/plain", "application/javascript", "text/markdown", "text/html", "text/csv", "application/rtp", "application/zip"];
    const contentTypeMainPart = attachment.contentType?.split(';')[0].trim() || "";
    if (!acceptedFileTypes.includes(contentTypeMainPart)) {
      return interaction.reply(await Utils.setupMessage(this.client.configs.lang.getSubsection("invalid-file-type"), []));
    }

    const confirmationMessage = await interaction.deferReply();

    const arrayBuffer = await fetch(attachment.url).then(res => res.arrayBuffer());
    const buffer = Buffer.from(arrayBuffer);

    const tokensResult = await wsClient.request('count_tokens', {
      filename: attachment.name,
      buffer: buffer.toString('base64'),
    });

    const tokens = tokensResult.data.tokens;
    const filesAmount = tokensResult.data.files_amount;
    const costPerToken = mode === 'basic' ? 0.0001 : 0.0002;
    const credits =  parseInt(Math.max(filesAmount, (tokens * costPerToken)).toFixed(0));

    if (user.credits < credits) {
      return interaction.editReply(await Utils.setupMessage(this.client.configs.lang.getSubsection("not-enough-credits"), [
        ...Utils.userVariables(user),
        { searchFor: '%price%', replaceWith: credits },
      ]));
    }

    await interaction.editReply(await Utils.setupMessage(this.client.configs.lang.getSubsection("translate-confirmation"), [
      { searchFor: '%file_name%', replaceWith: attachment.name },
      { searchFor: '%language%', replaceWith: language },
      { searchFor: '%mode%', replaceWith: mode },
      { searchFor: '%price%', replaceWith: credits.toString() },
      ...Utils.userVariables(user),
    ]));

    const collector = confirmationMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

    collector.on('collect', async (buttonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) {
        return buttonInteraction.reply({ content: 'You cannot use this button.', ephemeral: true });
      }

      if (buttonInteraction.customId === 'translate_confirm') {
        collector.stop();
        user.removeCredits(credits);
      
        confirmationMessage.edit(await Utils.setupMessage(this.client.configs.lang.getSubsection("translation-started"),
          [
            { searchFor: '%file_name%', replaceWith: attachment.name },
            { searchFor: '%language%', replaceWith: language },
            { searchFor: '%mode%', replaceWith: mode },
            { searchFor: '%price%', replaceWith: credits.toString() },
            ...Utils.userVariables(user),
          ]));

        const result = await wsClient.translateFile(
          attachment.name,
          buffer,
          language,
          mode === 'basic' ? 'basic' : 'advanced',
          async (current, total, percent) => {
            confirmationMessage.edit(await Utils.setupMessage(this.client.configs.lang.getSubsection("translation-progress"),
              [
                { searchFor: '%current%', replaceWith: current.toString() },
                { searchFor: '%total%', replaceWith: total.toString() },
                { searchFor: '%percent%', replaceWith: percent.toFixed(2) + '%' },
                { searchFor: '%file_name%', replaceWith: attachment.name },
                { searchFor: '%language%', replaceWith: language },
                { searchFor: '%mode%', replaceWith: mode },
                { searchFor: '%price%', replaceWith: credits.toString() },
                ...Utils.userVariables(user),
              ]));
          }
        );

        if (result) {
          const translatedAttachment = new AttachmentBuilder(result.buffer, {
            name: result.filename,
            description: 'Translated with ItsMyTranslate'
          });

          await confirmationMessage.edit(await Utils.setupMessage(this.client.configs.lang.getSubsection("translation-finished"), []));
          const reply = await Utils.setupMessage(this.client.configs.lang.getSubsection("translation-success"), [
            { searchFor: '%file_name%', replaceWith: result.filename },
            { searchFor: '%language%', replaceWith: language },
            { searchFor: '%mode%', replaceWith: mode },
            ...Utils.userVariables(user),
          ])
          reply.files = [translatedAttachment];
          await interaction.followUp(reply);
        } else {
          await interaction.followUp(await Utils.setupMessage(this.client.configs.lang.getSubsection("translation-failed"), [
            ...Utils.userVariables(user),
            { searchFor: '%price%', replaceWith: credits.toString() },
          ]));
        }
      }
    });
  }
}