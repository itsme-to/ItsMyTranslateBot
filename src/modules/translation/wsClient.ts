import WebSocket from 'ws';
import { EventEmitter } from 'events';
import crypto from 'crypto';
import { Logger } from '../../components/logger.js';

export class TranslationWSClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private connected = false;
  private reconnectAttempts = 0;
  private pendingMessages: any[] = [];
  private pendingRequests = new Map<string, (value: any) => void>();
  private logger = new Logger()

  constructor(private url: string, private token: string) {
    super();
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(`${this.url}?token=${encodeURIComponent(this.token)}`);

    this.ws.on('open', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.logger.info('[TranslationWS] Connected');
      this.startHeartbeat();
      this.pendingMessages.forEach(msg => this.ws?.send(msg));
      this.pendingMessages = [];
      this.emit('open');
    });

    this.ws.on('close', (code, reason) => {
      this.connected = false;
      this.logger.warn(`[TranslationWS] Closed (${code}): ${reason}`);
      this.emit('close', code, reason);
      this.scheduleReconnect();
    });

    this.ws.on('message', (raw) => this.handleMessage(raw));
    this.ws.on('error', (err) => {
      this.logger.error('[TranslationWS] Error', err);
      this.emit('error', err);
    });
  }

  private scheduleReconnect() {
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 10000);
    this.logger.info(`[TranslationWS] Reconnecting in ${delay / 1000}s`);
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private handleMessage(raw: WebSocket.RawData) {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.taskId && this.pendingRequests.has(msg.taskId)) {
        const resolver = this.pendingRequests.get(msg.taskId)!;
        this.pendingRequests.delete(msg.taskId);
        return resolver(msg);
      }
      this.emit('message', msg);
    } catch (e) {
      this.logger.error('[TranslationWS] Invalid message', e);
    }
  }

  public send(data: any) {
    const json = JSON.stringify(data);
    if (!this.connected) {
      this.pendingMessages.push(json);
    } else {
      this.ws?.send(json);
    }
  }

  public request(action: string, payload: any): Promise<any> {
    const taskId = crypto.randomUUID();
    return new Promise((resolve) => {
      this.pendingRequests.set(taskId, resolve);
      this.send({ action, payload: { ...payload, taskId } });
    });
  }

  public async translateFile(
    filename: string,
    buffer: Buffer,
    lang: string,
    onProgress?: (current: number, total: number, percent: number) => void
  ): Promise<{ buffer: Buffer; filename: string; mime: string }> {
    const taskId = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      const onMessage = (msg: any) => {
        if (msg.taskId !== taskId) return;

        switch (msg.event) {
          case 'progress':
            if (onProgress) {
              const { current, total, percent } = msg.data;
              onProgress(current, total, percent);
            }
            break;

          case 'done':
            this.off('message', onMessage);
            return resolve({
              buffer: Buffer.from(msg.data.buffer, 'base64'),
              filename: msg.data.filename,
              mime: msg.data.mime
            });

          case 'error':
            this.off('message', onMessage);
            return reject(new Error(msg.data.message));
        }
      };

      this.on('message', onMessage);

      this.send({
        action: 'translate',
        payload: {
          taskId,
          filename,
          buffer: buffer.toString('base64'),
          lang
        }
      });
    });
  }

  private startHeartbeat() {
    setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30000);
  }
}