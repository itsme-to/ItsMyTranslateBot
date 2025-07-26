import { TranslationWSClient } from './wsClient.js';

const wsClient = new TranslationWSClient(
  process.env.WS_TRANSLATION_URL || 'ws://localhost:3000',
  process.env.WS_TRANSLATION_TOKEN || ''
);

export default wsClient;