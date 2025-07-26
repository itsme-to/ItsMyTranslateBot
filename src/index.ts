import 'reflect-metadata';
import { GatewayIntentBits } from 'discord.js';
import { Manager } from './manager.js';
import 'dotenv/config';

const client = new Manager(
  {
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.DirectMessageReactions
    ],
  });

client.initialize();

export default client;