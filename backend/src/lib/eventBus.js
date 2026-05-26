const { EventEmitter } = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  publish(eventName, payload) {
    setImmediate(() => {
      try {
        this.emit(eventName, payload);
        this.emit('*', eventName, payload);
      } catch (err) {
        console.error(`[EventBus] error processing event "${eventName}":`, err.message);
      }
    });
  }

  subscribe(eventName, handler) {
    this.on(eventName, handler);
  }

  subscribeAll(handler) {
    this.on('*', handler);
  }
}

// Singleton — survives Vite HMR via module cache; backend has no HMR concern
const eventBus = new EventBus();

module.exports = eventBus;
