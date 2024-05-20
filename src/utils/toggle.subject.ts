import { BehaviorSubject } from 'rxjs';

export class ToggleSubject<T> extends BehaviorSubject<T> {
  constructor(
    private values: T[],
    initial: T = values[0]
  ) {
    super(initial);
  }

  toggle(values: T[] = this.values): void {
    let i = values.indexOf(this.value) + 1;
    if (i >= values.length) i = 0;

    this.next(values[i]);
  }
}
