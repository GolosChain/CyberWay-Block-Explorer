import { Client } from 'rpc-websockets';

let instance = null;

export default class Connection {
  static get() {
    return instance;
  }

  constructor({ url }) {
    this.url = url;
    this.queue = [];
    instance = this;
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

      socket.on('error', err => {
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

  async callApi(apiName, params) {
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
