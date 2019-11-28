// @ts-ignore
import { Client } from 'rpc-websockets';

type QueueItem = {
  apiName: string;
  params: any;
  resolve: Function;
  reject: Function;
  timeoutId: number;
};

let instance: Connection | null = null;

export default class Connection {
  static get() {
    if (!instance) {
      throw new Error('No connection');
    }

    return instance;
  }

  private readonly url: string;
  private queue: QueueItem[];
  private socket: Client | null;

  constructor({ url }: { url: string }) {
    this.url = url;
    this.queue = [];
    this.socket = null;

    instance = this;

    if (process.env.NODE_ENV !== 'production') {
      // @ts-ignore
      window._client = instance;
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      const socket = new Client(this.url);

      let connected = false;

      socket.on('open', () => {
        connected = true;
        this.socket = socket;
        resolve();

        this.flushQueue();
      });

      socket.on('error', (err: Error) => {
        // eslint-disable-next-line no-console
        console.error('WebSocket disconnected:', err);
        reject(err);

        if (connected) {
          this.close();
          this.connect();
        }
      });

      // socket.on('onlineNotify', data => {
      //   this.onNotifications(data.result);
      // });
    });
  }

  async callApi(apiName: string, params = {}): Promise<any> {
    if (!this.socket) {
      return new Promise((resolve, reject) => {
        const delayedItem = {
          apiName,
          params,
          resolve,
          reject,
          timeoutId: setTimeout(() => {
            this.queue = this.queue.filter(item => item !== delayedItem);
            reject(new Error('Queue timeout error'));
          }, 5000),
        };

        this.queue.push(delayedItem);
      });
    }

    return this.socket.call(apiName, params);
  }

  flushQueue() {
    for (const item of this.queue) {
      clearTimeout(item.timeoutId);
      item.resolve(this.callApi(item.apiName, item.params));
    }
    this.queue = [];
  }

  close() {
    if (this.socket) {
      try {
        this.socket.close();
      } catch (err) {
        // Ignore errors when closing
      }

      this.socket = null;
    }
  }
}
