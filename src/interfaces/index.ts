import { ActionRowData, APIMessageTopLevelComponent, BitFieldResolvable, Attachment, AttachmentBuilder, BufferResolvable, MessageMentionOptions, PollData, MessageActionRowComponentBuilder, MessageActionRowComponentData, TopLevelComponentData, JSONEncodable, ActionRowBuilder, ContainerBuilder, FileBuilder, MediaGalleryBuilder, SectionBuilder, SeparatorBuilder, TextDisplayBuilder  } from 'discord.js';
export * from './service.js';
export * from './variable.js';
import { Stream } from 'stream';

export type TopLevelComponentBuilder = 
  ActionRowBuilder<MessageActionRowComponentBuilder> |
  ContainerBuilder |
  FileBuilder | 
  MediaGalleryBuilder |
  SectionBuilder |
  SeparatorBuilder |
  TextDisplayBuilder;

export interface MessageOutput {
  allowedMentions: MessageMentionOptions,
  components: (ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder> | TopLevelComponentData | APIMessageTopLevelComponent | JSONEncodable<APIMessageTopLevelComponent>)[],
  files: (Attachment | AttachmentBuilder | Stream | BufferResolvable)[],
  poll?: PollData
  flags?: BitFieldResolvable<any, number> | undefined
}