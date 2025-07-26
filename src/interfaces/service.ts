import { Manager } from "../manager.js";

export class Service {
  protected client: Manager;

  constructor(client: Manager) {
    this.client = client;
  }

  async initialize() {
    throw new Error('Method not implemented.');
  }
}
