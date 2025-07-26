import Utils from '../index.js';
import { Config } from '../../components/index.js';
import { Variable } from '../../interfaces/index.js';
import { ActionRowComponent, MessageComponentBuilder, ContainerComponentBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, SeparatorBuilder, SectionBuilder, MediaGalleryBuilder, FileBuilder, MediaGalleryItemBuilder } from 'discord.js';

export type SetupComponentType = MessageComponentBuilder | ContainerComponentBuilder | ActionRowComponent | undefined;

export async function setupComponent<T extends SetupComponentType = SetupComponentType>(config: Config, variables: Variable[] = []): Promise<T[] | undefined> {
  const type = config.getString('type');

  let condition = await Utils.applyVariables(config.getStringOrNull('condition'), variables);
  if (condition) {
    const isMet = Utils.evaluateBoolean(condition);
    if (!isMet) return
  }


  switch (type) {
    case 'button': {
      return [await Utils.setupButton(config, variables) as T];
    }
  
    case 'select-menu': {
      return [await Utils.setupSelectMenu(config, variables) as T];
    }

    case 'text-display': {
      return [await Utils.setupTextDisplay(config, variables) as T];
    }

    case 'separator': {
      const separator = new SeparatorBuilder()
        .setSpacing(config.getNumber('spacing'))
        .setDivider(config.getBoolOrNull('divider') || true)

      return [separator as T]
    }

    case 'section': {
      const section = new SectionBuilder()
      
      for (const componentConfig of config.getSubsections('components')) {
        let condition = await Utils.applyVariables(componentConfig.getStringOrNull('condition'), variables);
        if (condition) {
          const isMet = Utils.evaluateBoolean(condition);
          if (!isMet) return
        }

        const textDisplay = await Utils.setupTextDisplay(componentConfig, variables);
        section.addTextDisplayComponents(textDisplay);
      }

      if (!section.components.length) return

      const accessory = config.getSubsection('accessory')
      if (accessory.getString('type') === 'button') {
        section.setButtonAccessory(await Utils.setupButton(accessory, variables))
      } else {
        section.setThumbnailAccessory(await Utils.setupThumbnail(accessory, variables))
      }

      return [section as T]
    }

    case 'media-gallery': {
      const mediaGallery = new MediaGalleryBuilder()
      
      for (const mediaconfig of config.getSubsections('items')) {
        let condition = await Utils.applyVariables(mediaconfig.getStringOrNull('condition'), variables);
        if (condition) {
          const isMet = Utils.evaluateBoolean(condition);
          if (!isMet) return
        }
        
        mediaGallery.addItems((await setupMediaGalleryItemBuilder(mediaconfig, variables)))
      }

      if (!mediaGallery.items.length) return

      return [mediaGallery as T]
    }

    case 'file': {
      const file = new FileBuilder()
        .setSpoiler(config.getBoolOrNull('spoiler') || false)
        .setURL(await Utils.applyVariables(config.getString('url', true), variables))

      return [file as T]
    }

    case 'action-row': {
      const components = config.getSubsections('components');
      const actionRow = new ActionRowBuilder();

      for (const componentConfig of components) {
        const component = await Utils.setupComponent<MessageActionRowComponentBuilder>(componentConfig, variables);
        if (component) actionRow.addComponents(component);
      }

      if (!actionRow.components.length) return

      return [actionRow as T]
    }

    case 'container': {
      return [await Utils.setupContainer(config, variables) as T];
    }
  }
}


async function setupMediaGalleryItemBuilder(config: Config, variables: Variable[] = [])  {
  const description = await Utils.applyVariables(config.getStringOrNull('description', true), variables)

  const item = new MediaGalleryItemBuilder()
    .setSpoiler(config.getBoolOrNull('spoiler') || false)
    .setURL(await Utils.applyVariables(config.getString('url', true), variables))

  if (description) item.setDescription(description)

  return item
}