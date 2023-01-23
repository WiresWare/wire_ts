import { Wire } from 'cores.wire';

class CounterButton {
  constructor(button: HTMLButtonElement, signal: string) {
    button.onclick = async () => {
      button.disabled = true;
      // There is no payload since the signal defines
      // only operation (for general purpose button)
      await Wire.send(signal).finally(() => {
        button.disabled = false;
      });
    };
  }
}

export default CounterButton;
