import { Logger } from '../logger.js';
import Utils from '../../utils/index.js';
import * as fs from 'fs/promises';
import { join, resolve } from 'path';
import { glob } from 'glob';
import { Collection } from 'discord.js';
import { BaseConfig } from './baseConfig.js';

export class BaseConfigSection {
  public logger = new Logger();
  public configs: Collection<string, BaseConfig> = new Collection();

  private configFolderPath: string;
  private relConfigFolderPath: string;

  constructor(configFolderPath: string) {
    this.configFolderPath = configFolderPath;
    this.relConfigFolderPath = join(resolve(), configFolderPath);
  }

  async initialize() {
    if (!await Utils.fileExists(this.relConfigFolderPath)) {
      this.logger.warn(`Config folder not found at ${this.relConfigFolderPath}, creating one`);
      await fs.mkdir(this.relConfigFolderPath, { recursive: true });
    }

    await this.loadConfigs();
    return this.configs;
  }

  async loadConfigs() {
    const files = await glob('**/!(_)*.yml', { cwd: this.relConfigFolderPath, dot: true });

    for (const file of files) {
      const destPath = join(this.configFolderPath, file);
      const id = file.slice(0, -4); // remove .yml extension

      const config = new BaseConfig(id, destPath);
      await config.initialize();
      this.configs.set(id, config);
    }
  }
}