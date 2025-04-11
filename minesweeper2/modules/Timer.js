export default class Timer {
  constructor() {
    this.time = 0;
    this.interval = null;
    this.isRunning = false;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.interval = setInterval(() => {
        this.time++;
      }, 1000);
    }
  }

  stop() {
    if (this.isRunning) {
      clearInterval(this.interval);
      this.isRunning = false;
    }
  }

  reset() {
    this.stop();
    this.time = 0;
  }

  getTime() {
    return this.time;
  }
}
