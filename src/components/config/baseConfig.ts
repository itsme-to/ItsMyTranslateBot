import { Config } from './config.js';
import * as fs from 'fs/promises';
import { join, resolve } from 'path';
import { parseDocument } from 'yaml';

export class BaseConfig extends Config {
  /** Id of the file, it's the relative path without the extension */
  public id: string
  private configFilePath: string;

  constructor(id: string, configFilePath: string) {
    super(configFilePath);

    this.id = id
    this.configFilePath = join(resolve(), configFilePath);
  }

  async initialize() {
    const configContent = parseDocument(await fs.readFile(this.configFilePath, 'utf8'));
    this.init(configContent.toJS());
    return this;
  }
}
