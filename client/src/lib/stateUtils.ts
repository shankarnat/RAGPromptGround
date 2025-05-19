// State management utilities to prevent race conditions

export class StateManager<T> {
  private queue: Array<() => void> = [];
  private isProcessing = false;
  private lastState: string = '';

  constructor(private setState: React.Dispatch<React.SetStateAction<T>>) {}

  update(updater: (prev: T) => T) {
    this.queue.push(() => {
      this.setState((prev) => {
        const newState = updater(prev);
        const stateString = JSON.stringify(newState);
        
        // Prevent duplicate updates
        if (stateString === this.lastState) {
          return prev;
        }
        
        this.lastState = stateString;
        return newState;
      });
    });

    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const update = this.queue.shift();
      if (update) {
        update();
        // Small delay to allow React to process the update
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    this.isProcessing = false;
  }
}