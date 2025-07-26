import 'reflect-metadata';
import { GatewayIntentBits, Partials } from 'discord.js';
import { Manager } from './manager.js';
import 'dotenv/config';

const client = new Manager(
  {
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.MessageContent
    ],
    partials: [
      Partials.Message,
      Partials.Channel,
      Partials.User
    ]
  });

client.initialize();

export default client;